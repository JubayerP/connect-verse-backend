const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const dotenv = require("dotenv")

dotenv.config();


// Middleware
app.use(cors());
app.use(express.json())



const uri = process.env.DB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const postCollection = client.db("connectVerse").collection("posts");

        app.post('/posts', async (req, res) => {
            const post = req.body;

            const result = await postCollection.insertOne(post);
            res.send(result);
        })

        app.get("/posts", async (req, res) => {
            const posts = await postCollection.find({}).toArray();
            res.send(posts);
        })

        app.get("/posts/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const post = await postCollection.findOne(query);
            res.send(post);
        })

        app.post("/posts/:postId/like", async (req, res) => {
            const userId = req.body.userId;
            const postId = req.params.postId;

            const post = await postCollection.findOne({ _id: new ObjectId(postId) })

            // like check

            const alreadyLiked = post.likes.find((like) => like.userId === userId)
            if (alreadyLiked) {
                await postCollection.updateOne({ _id: new ObjectId(postId) }, { $pull: { likes: { userId: userId } } }, err => {
                    if (err) {
                        res.status(500).send(err)
                    } else {
                        res.status(200).send('Post unliked');
                    }
                })
            }
            else {
                const like = { userId: userId, postId: postId }
                
                const liked = await postCollection.updateOne({ _id: new ObjectId(postId) }, { $push: { likes: like } })
                res.send(liked)
            }
        })
    }
    finally {

    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('App is running')
})



app.listen(port, () => {
    console.log(`app is listening to port on ${port}`);
})