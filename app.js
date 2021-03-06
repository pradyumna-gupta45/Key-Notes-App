//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-pradyumna:akhilesh1407@cluster0.l9dun.mongodb.net/todolistDB", {useNewUrlParser:true});



// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

//schema creation
const itemsSchema= {
  name:String
};

//model creation
const Item =mongoose.model("Item", itemsSchema);

const item1=new Item({
  name: "Welcome to your todolist!"
});

const item2=new Item({
  name: "Hit the + button to add a new item."
});

const item3=new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems= [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List= mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

      if(foundItems.length === 0){
        Item.insertMany(defaultItems, function(err){
          if(err)
          {
          console.log(err);
        }
          else
          {
          console.log("Successfully saved default items to DB.");
        }
        });
        res.redirect("/");
      }
      else
      res.render("list", {listTitle: "Today", newListItems: foundItems});
  });

// const day = date.getDate();


});

  app.get("/:CustomListName", function(req, res){
    // console.log(req.params.CustomListName);
    const CustomListName= _.capitalize(req.params.CustomListName);

    List.findOne({name:CustomListName}, function(err, foundList){
      if(!err)
      {
        if(!foundList)
        {
          //create a new list
          const list= new List({
            name: CustomListName,
            items: defaultItems
          });
               list.save();
              res.redirect("/"+CustomListName);
        }
        else
        {
          //show an existing list
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }
      }
    })


  });

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName==="Today")
  {
    item.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req,res){
  // console.log(req.body);
  const checkedItemId = req.body.checkbox; //id of a particular item that is clicked
  const listName= req.body.listName;

  if(listName==="Today")
  {
      Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err)
            {
              console.log("Successfully deleted checked item!");
              res.redirect("/");
            }
      });
  }
  else //listname is not our default name
  {
      List.findOneAndUpdate( {name: listName}, {$pull: {items:{_id: checkedItemId} }}, function(err, foundList){
          if(!err)
          {
            res.redirect("/"+listName);
          }
      });

  }



});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});



app.get("/about", function(req, res){
  res.render("about");
});

/*
let port= process.env.PORT;
if(port == NULL || port ==""){
  port=3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
*/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port ${PORT}"));
