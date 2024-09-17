const express = require("express");
const bodyPaser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


// console.log(date());
const app = express();
app.set("view engine", "ejs");
app.use(bodyPaser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/todolistDB");
mongoose.connect("mongodb+srv://irumvaarsene1:irumvaarsene17%40.@cluster0.9f6it.mongodb.net/todolistDB")
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.log('Error connecting to MongoDB:', error));

const itemsSchema = {
    name: String
};

Item = mongoose.model("Item", itemsSchema);


const item1 = new Item({

    name:"welcome to your to do list"
});

const item2 = new Item({

    name:"hit the + button to add a new item"
});

const item3 = new Item({

    name:"<-- hit this to delete item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", (req, res)=>{

    Item.find({})
        .then((foundItems)=>{

            if(foundItems.length === 0){
                Item.insertMany(defaultItems)
                .then(()=>{
                    console.log("success to insert the default Items.");
                })
                .catch((err)=>{
                    console.log("this is the error"+err);
                });

                res.redirect("/");
            }else{
                res.render("list", {listTitle: "Today", newListItems: foundItems});
            }
            
        })
        .catch((err)=>{
            console.log(err);
        });



    // res.render("list", {listTitle: "Today", newListItems: items});

});

app.post("/", (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName})
            .then((foundList)=>{
                foundList.items.push(item);
                foundList.save();
                res.redirect("/"+ listName);
            })
            .catch((err)=>{
                console.log("WTF this error:"+ err);
            });
    }

});


app.post("/delete", function(req, res){

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndDelete({_id:checkedItemId})
        .then(()=>{
            console.log("the item was deleted");
        })
        .catch((err)=>{
            console.log(err);
        });

    res.redirect("/");

    }else{
        List.findOneAndUpdate({name: listName},{$pull:{items:{_id: checkedItemId}}})
            .then((foundList)=>{
                res.redirect("/"+ listName);
            })
            .catch((err)=>{
                console.log(err);
            });
    }

});


app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName})
        .then((foundList)=>{
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
            
                list.save();
                res.redirect("/"+ customListName);
            }
            res.render("list", {listTitle: foundList.name, newListItems: foundList.items});

        })
        .catch((err)=>{
            console.log(err);
        })

    
});




app.listen(3000, ()=>{
    console.log("Server is running on Port 3000.");
});