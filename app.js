

// Budget Module

var budgetController = (function(){

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function(totalIncome){
        if( totalIncome > 0){
            this.percentage = Math.round( (this.value / totalIncome) * 100 );
        }else{
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var data = {
        allItems : {
            exp : [],
            inc : [],
        },
        totals : {
            exp : 0,
            inc : 0        
        },
        budget : 0,
        percentage : -1
    }

    var calculateTotal = function(type){
        var sum = 0;

        data.allItems[type].forEach(function(current){
            sum += current.value;
        });

        data.totals[type] = sum;
    }

    return {
        addItem : function(type, desc, val){
            var newItem, ID;

            //create new id 
            if( data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;

            }else{
                ID = 0;
            }

            //create new item based on type
            if( type === 'inc' ){
                newItem = new Income(ID, desc, val);
            }else if( type === 'exp' ){
                newItem = new Expense(ID, desc, val);
            }

            // add to datastructure
            data.allItems[type].push(newItem);

            //return new element
            return newItem;
        },
        calculateBudget : function(){
            
            // calculate income and expenses
            calculateTotal('exp');
            calculateTotal('inc');  

            //total budget = income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the % of income that we spent
            if( data.totals.inc > 0 ){
                data.percentage = Math.round( (data.totals.exp / data.totals.inc) * 100 );
            }else{
                data.percentage = -1;
            }

        },
        getBudget : function(){
            return {
                budget : data.budget,
                totalIncome : data.totals.inc,
                totalExpense : data.totals.exp,
                percentage : data.percentage
            }
        },

        deleteItem : function(type, id){
            var ids, index;

                ids = data.allItems[type].map(function(current){
                    return current.id;
                });
                index = ids.indexOf(id);

                if( index !== -1){
                    data.allItems[type].splice(index,1);
                }
        },

        testing : function(){
            return data;
        },

        calculatePercentages : function(){
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            })
        },

        getPercentages : function(){
            var allPercentages = data.allItems.exp.map(function(current){
                return current.getPercentage();
            })
            return allPercentages;
        }
    }
   

})();

// UI module

var UIController = (function(){

    var DOMStrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        addBtn : '.add__btn',
        incomeElement : '.income__list',
        expenseElement : '.expenses__list',
        budgetLabel : '.budget__value',
        totalIncomeLabel : '.budget__income--value',
        totalExpenseLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expensesPercLabel : '.item__percentage',
        monthLabel : '.budget__title--month'
    }

    var formatNumber = function(num, type){

        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        dec = numSplit[1];

        if( int.length > 3 ){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        }

        return ( type === 'inc' ? '+' : '-') + '' + int + '.' + dec;

    }

    var nodeListForEach = function(list, callback){
        for( var i = 0 ; i < list.length ; i++){
            callback(list[i], i);
        }
    } 

    return {
        getInput : function(){
            return {
                type : document.querySelector(DOMStrings.inputType).value,
                description : document.querySelector(DOMStrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMStrings.inputValue).value)//parseFlost to get numeric
            }
        },

        addListItem : function(obj, type){
            var html, newHtml, element;

            // create HTML string with placeholder text
            if( type === 'inc'){
                element = DOMStrings.incomeElement;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if( type === 'exp' ){
                element = DOMStrings.expenseElement;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // replace the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            newHtml = newHtml.replace('%description%', obj.description);

            // insert the HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        getDOMStrings : function(){
            return DOMStrings;
        },

        resetInputFields: function(){
            document.querySelector(DOMStrings.inputDescription).value = '';
            document.querySelector(DOMStrings.inputValue).value = "";
            document.querySelector(DOMStrings.inputDescription).focus();
        },

        updateBudgetUI : function(obj){

            var type = obj.budget > 0 ? 'inc' : 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget === 0 ? '0.00' : formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.totalIncomeLabel).textContent = formatNumber(obj.totalIncome,'inc');
            document.querySelector(DOMStrings.totalExpenseLabel).textContent=formatNumber(obj.totalExpense,'exp');

            if( obj.percentage > 0 ){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%";
            }else{
                document.querySelector(DOMStrings.percentageLabel).textContent = '---'
            }  
        },

        deleteListItem : function(id){
            var el = document.getElementById(id);
            el.parentNode.removeChild(el);
        },

        displayPercentages : function(percentages){

            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);  

            nodeListForEach(fields, function(current, index){
                if( percentages[index] > 0 ){
                    current.textContent = percentages[index] + "%";
                }else{
                    current.textContent = '---'
                }
            })

        },

        displayMonth : function() {
            var now, month, months; 
            now = new Date();

            months = ['January','February','March','April','May','June','July','August','September','November','December'];
            month = now.getMonth();

            document.querySelector(DOMStrings.monthLabel).textContent = months[month];
        },

        changeInputFieldColour : function() {
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );

            nodeListForEach( fields, function(current){
                current.classList.toggle('red-focus');
            })

            document.querySelector(DOMStrings.addBtn).classList.toggle('red');
        }
    }
})();


// global app module
var appController = (function(bdgtctrl, uictrl){


    var updateBudget = function(){
        // calculate budget 
        bdgtctrl.calculateBudget();

        // return the budget
        var budget = bdgtctrl.getBudget();

        // update the UI 
        uictrl.updateBudgetUI(budget);

    }

    var addItem = function(){
        var input, newElement;

        // get field input data
        input = uictrl.getInput();

        if( input.description !== '' && !isNaN(input.value) && input.value > 0){

            // add the item to budgetcontroller
            newElement = bdgtctrl.addItem(input.type, input.description, input.value);

            // add the new item to UI
            uictrl.addListItem(newElement, input.type);

            // reset the input values
            uictrl.resetInputFields();

            //calculate and update budget
            updateBudget();

            // calculate and update percentages
            updatePercentage();
        }else{
            alert("********Enter some value in fields**********");
        }   
    }

    var deleteItem = function(event){
        var itemId, splitId, type, id;
 
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if( itemId ){

            splitId = itemId.split('-');
            console.log(splitId);
            type = splitId[0];
            id = parseInt( splitId[1] );

            // delete item from datastructures
            bdgtctrl.deleteItem(type, id);

            // delete item from ui
            uictrl.deleteListItem(itemId);

            // re-calculate the budget
            updateBudget();

            // calculate and update percentages
            updatePercentage();
        }
    }

    var updatePercentage = function(){

        // calculate percentages
        bdgtctrl.calculatePercentages();

        // get percentages from budgetcontroller
        var percentages = bdgtctrl.getPercentages();

        // update UI
        uictrl.displayPercentages(percentages);
    }

    var setupEventListeners = function(){
        var DOM = uictrl.getDOMStrings();
        document.querySelector(DOM.addBtn).addEventListener('click',addItem);

        document.addEventListener('keypress',function(event){
            if( event.keyCode === 13 || event.which === 13){
                addItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', deleteItem)

        document.querySelector(DOM.inputType).addEventListener('change', uictrl.changeInputFieldColour);
    }

    return {
        init : function(){
            console.log('Application has started.')
            uictrl.displayMonth();
            uictrl.updateBudgetUI({
                budget : 0,
                totalIncome : 0,
                totalExpense : 0,
                percentage : -1
            })
            setupEventListeners();
        }
    }
    
})(budgetController, UIController);

appController.init();