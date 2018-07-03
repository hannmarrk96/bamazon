var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root", //Your username
    password: "root", //your password
    database: "Bamazon" //database name
})

connection.connect(function(err) {
    if (err) throw err;
    list();
})

//List all items for sale
var list = function() {
	var query = 'SELECT * FROM `products`';
	connection.query(query, function (err, res) {
		for (var i = 0; i < res.length; i++) {
        	console.log("\n" + res[i].itemID + " | " + res[i].productName + " | " + res[i].price);
    	}
    	console.log("-----------------------------------");
    	buy();
	})
//Prompt user for the id number of item to purchase using npm inquirer
	var buy = function() {
	    inquirer.prompt([{
	        name: "itemID",
	        type: "input",
	        message: "Enter the itemID number (1-10) of the product you would like to buy: \n",
	        validate: function(value) {
	        	//If the input is a number between 1 and 10, returen true.
	        	//Otherwise prompt the user for a valid number.
	            if ((isNaN(value) == false) && (value > 0 && value < 11))  {
	                return true;
	            } else
	                console.log("Please enter a valid number (1-10).");
	                return false; 
	                buy();
	            }
	        }, {
	        name: "productQuantity",
	        type: "input",
	        message: "How many do you want to buy? ",
	        validate: function(value) {
	        	//Prompt the user for an integer greater than 0 if an invalid value is entered
	            if ((isNaN(value) == false) && (value > 0)) {
	                return true;
	            } else {
	                console.log("Please enter a valid non-negative integer.");
	                return false;
	                buy();
	            }
	        }
	    }]).then(function(answer) {
	    	//query should return price and quantity from the products database.
	    	var query = 'SELECT price,stockQuantity FROM products WHERE ?';
	    	connection.query(query, [answer.itemID], function(err, res) {
	    		//The index of the selection is the ID minus one.
	            i = answer.itemID - 1;
	            //The total cost is the quantity times the price of the selected item.
	    			var cost = (answer.productQuantity) * (res[i].price);
	    		if (err) {
	                console.log("Error " + err);
	                return;
	                //Alert the user if there is insufficient inventory to fulfill the order.
	            } else if (answer.productQuantity > res[i].stockQuantity) {
	            	console.log("Insufficient inventory! Try again later.");
	            	//end the connection to the database.
	            	connection.end();
	            } else {    
	            //If there is sufficient inventory, update the stock in the database by id number	
	            	var query = 'UPDATE `products` SET stockquantity = (stockquantity - ?) WHERE itemID = ?';
	    			connection.query(query, [answer.productQuantity, answer.itemID], function(err, res) {
	    				//Index is the id number minus one.
	    				i = answer.itemID - 1;
	            		if (err) {
	                	console.log("Error " + err);
	                	return;
	                	//Return the cost to the user after calculation.
	                	} else {
	                		//i = answer.id - 1;
	                		console.log("cost: " + cost);
	                		//console.log("inventory: " + res[i].stockquantity);
	                		//End the connection to the database.
	                		connection.end();
	                	}

	            	})
	            }
	       })
		})		
	};
}