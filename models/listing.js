const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review=require("./review.js")

const listingSchema = new mongoose.Schema({
    title: {
       type: String,
       required: true,
    },
    description: String,
    image: {
        type: String,
        default:"https://media.istockphoto.com/id/503019528/photo/road-front-of-luxury-building-in-clear-sky-at-night.jpg?s=612x612&w=0&k=20&c=xkjUByXNE5SdMSeYxLqIwweZMg9XZ6xnWEK7ypdeO4I=",
        set: (v) => v === "" ? "https://media.istockphoto.com/id/503019528/photo/road-front-of-luxury-building-in-clear-sky-at-night.jpg?s=612x612&w=0&k=20&c=xkjUByXNE5SdMSeYxLqIwweZMg9XZ6xnWEK7ypdeO4I=" : v,
    },
    price: Number,
    location: String,
    country: String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
             ref:"Review",
        },
    ],
});

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id:{$in: listing.reviews}});
    }
    

})

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
