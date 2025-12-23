import mongoose, {Schema} from "mongoose";


const likeSchema = new Schema({
    story: {
        type: Schema.Types.ObjectId,
        ref: "Story"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    
}, {timestamps: true})

export const Like = mongoose.model("Like", likeSchema)