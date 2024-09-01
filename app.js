const express=require("express");
const app=express();
const port=8080;
const mongoose=require("mongoose");
const path=require("path");
const methodOverride = require("method-override");
const ejsMate=require("ejs-mate")
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema , reviewSchema}=require("./schema.js")




const Review = require("./models/review");
const MONGO_URL="mongodb://127.0.0.1:27017/stayz";

const listings=require("./routes/listing.js");


main().then(()=>{
    console.log("Connected to Database");
})
.catch((err)=>{
    console.log(err);
})
async function main() {
    await mongoose.connect(MONGO_URL);
}
app.use(express.static(path.join(__dirname,"/public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);


app.get("/",(req,res)=>{
    res.send("hi");
});



const validateReview=(req,res,next)=>{
    let {error}= reviewSchema.validate(req.body);
    
    if(error){
        let errMsg = error.details.map((el) => el.message).join(", ");

        throw new ExpressError(400,errMsg)
    }
    else{
        next();
    }
};

app.use("/listings",listings);



// app.get("/testlisting",async(req,res)=>{
//     let samplelisting=new Listing({
//         title:"My New Villa",
//         description:"Luxury Experience",
//         price:2200,
//         location:"Blueberry Hills, Goa",
//         country:"India"
//     });
//     await samplelisting.save();
//     console.log("Sample was saved");
//     res.send("Successful Testing"); 
// })

//INDEX ROUTE
app.get("/listings", wrapAsync( async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }));

  //NEW ROUTE
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})
//CREATE ROUTE
app.post("/listings",validateListing, wrapAsync( async (req, res,next) => {
       
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");  
}));

//Edit Route
app.get("/listings/:id/edit", wrapAsync( async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
app.put("/listings/:id",validateListing, wrapAsync( async (req, res) => {
    
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  }));
  
  //Delete Route
  app.delete("/listings/:id", wrapAsync( async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
  }));



//SHOW ROUTE
app.get("/listings/:id", wrapAsync( async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
}));

//REVIEWS
//post route
app.post("/listings/:id/reviews", validateReview,wrapAsync( async (req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`)
}))

//Delete review route
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
    let{id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});

    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}))
  

//STANDARD RESPONSE
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found!"))
})

//  ERROR HANDLER 
// app.use((err,req,res,next)=>{
//     let{ statusCode , message }= err;
//     res.status(statusCode).send(message);
//     // res.send("something went wrong!");
// })
app.use((err, req, res, next) => {
    const { statusCode=500, message="Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
});



app.listen(port,()=>{
    console.log(`Server is listening on port ${port}`);
})