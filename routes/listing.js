const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema , reviewSchema}=require("../schema.js");
const Listing=require("../models/listing.js"); 

const validateListing=(req,res,next)=>{
    let {error}= listingSchema.validate(req.body);
    
    if(error){
        let errMsg = error.details.map((el) => el.message).join(", ");

        throw new ExpressError(400,errMsg)
    }
    else{
        next();
    }
};

//INDEX ROUTE
router.get("/", wrapAsync( async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }));

  //NEW ROUTE
router.get("/new",(req,res)=>{
    res.render("listings/new.ejs");
})
//CREATE ROUTE
router.post("/",validateListing, wrapAsync( async (req, res,next) => {
       
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");  
}));

//Edit Route
router.get("/:id/edit", wrapAsync( async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id",validateListing, wrapAsync( async (req, res) => {
    
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  }));
  
  //Delete Route
router.delete("/:id", wrapAsync( async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
  }));

//SHOW ROUTE
router.get("/:id", wrapAsync( async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
}));

//REVIEWS
//post route
router.post("/:id/reviews", validateReview,wrapAsync( async (req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`)
}))

//Delete review route
app.delete("/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
    let{id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});

    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}))
  

//STANDARD RESPONSE
router.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found!"))
})

//  ERROR HANDLER 
// app.use((err,req,res,next)=>{
//     let{ statusCode , message }= err;
//     res.status(statusCode).send(message);
//     // res.send("something went wrong!");
// })
router.use((err, req, res, next) => {
    const { statusCode=500, message="Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
});

module.exports=router;