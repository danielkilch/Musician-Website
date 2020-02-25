//Variablen definieren


const WarenkorbButton = document.querySelector(".Warenkorb-Button");
const WarenkorbSchließen = document.querySelector(".Warenkorb-Schliessen");
const WarenkorbLeeren = document.querySelector(".Warenkorb-löschen");
const WarenkorbOverlay = document.querySelector(".Warenkorb-Overlay");
const WarenkorbDOM = document.querySelector(".Warenkorb");
const WarenkorbProdukte = document.querySelector(".Warenkorb-Inhalt");
const WarenkorbSumme = document.querySelector(".Summe");
const ProdukteDOM = document.querySelector(".Produkte");
const WarenkorbButtonAnzahl = document.querySelector(".Warenkorb-Button-Anzahl");

//Warenkorb

let cart = [];

//Buttons

let buttonsDOM =[];


//Produkte aus JSON bekommen

class Products {
    async getProducts() {
        try{
            let result = await fetch("../products.json");
            let data = await result.json();
            let products= data.items;
           
            return products
           } catch (error) {console.log(error)};
    }
    
}

//Produkte anzeigen

class UI {
    displayProducts(products){
        let result= "";
        products.forEach(product => {
            result += 
                `<div class="Produkt">
                    <img src= ${product.url} class= "Produkt-Bild">
                    <button class= "Warenkorb-Banner" data-id =${product.id}>Zum Warenkorb hinzufügen</button>
                    <span class= "Album-Name">${product.title}</span>
                    <span class= "Album-Preis"> ${product.price} €</span>
                </div>`;
            
        });
        ProdukteDOM.innerHTML = result;
        
        
    }

    getBagButtons(){
        const buttons = [...document.querySelectorAll(".Warenkorb-Banner")];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id ===id);
            if(inCart){
                button.innerText = "Im Warenkorb";
                button.disabled = true;
            } else {
                button.addEventListener("click", event =>{
                    event.target.innerText = "Im Warenkorb";
                    event.target.disabled = true;
                    let cartItem = {...Storage.getProduct(id), amount:1};
                    cart= [...cart,cartItem];
                    this.SetCartValues(cart);
                    this.addCartItem(cartItem);
                    this.showCart();
                })
            }
        })


        

       

    }
    
    SetCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        WarenkorbSumme.innerText = parseFloat(tempTotal.toFixed(2));
        WarenkorbButtonAnzahl.innerText = itemsTotal;
    }
    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('Warenkorb-Element');
        div.innerHTML =`<img src=${item.url}>        
        
        <div>
            <h4>${item.title}</h4>
            <h5>${item.price} €</h5>
            <span class = "Element-entfernen" data-id=${item.id}>entfernen</span>
        </div>
        <div>
            <i class = "fas fa-chevron-up" data-id=${item.id}></i>
            <p class = "Anzahl">${item.amount}</p>
            <i class = "fas fa-chevron-down" data-id=${item.id}></i>
        </div>`;
        WarenkorbProdukte.appendChild(div);

    }

    showCart(){
        WarenkorbOverlay.classList.add('transparentBCG');
        WarenkorbDOM.classList.add('showCart');

    }

    setupAPP(){
        cart= Storage.getCart();
        this.SetCartValues(cart);
        this.populateCart(cart);
        WarenkorbButton.addEventListener("click", this.showCart);
        WarenkorbSchließen.addEventListener("click", this.hideCart);


    }

    populateCart(cart){
        cart.forEach(item => this.addCartItem(item));

    }

    hideCart(){
        WarenkorbOverlay.classList.remove("transparentBCG");
        WarenkorbDOM.classList.remove("showCart");

    }

    cartLogic(){
        WarenkorbLeeren.addEventListener("click", ()=>{
            this.clearCart();

        });
        WarenkorbProdukte.addEventListener("click", event =>{
            if(event.target.classList.contains('Element-entfernen')){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                WarenkorbProdukte.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }else if(event.target.classList.contains("fa-chevron-up")){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id===id);
                tempItem.amount= tempItem.amount + 1;
                Storage.saveCart(cart);
                this.SetCartValues(cart);
                addAmount.nextElementSibling.innerText =
                tempItem.amount;

            } else if(event.target.classList.contains("fa-chevron-down")){

                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id===id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount >0){
                    Storage.saveCart(cart);
                    this.SetCartValues(cart);
                    lowerAmount.previousElementSibling.innerText= tempItem.amount;

                } else
                {   WarenkorbProdukte.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);

                }


            }
        })

    }
    clearCart(){
        let cartItems= cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while(WarenkorbProdukte.children.length >0) {
            WarenkorbProdukte.removeChild(WarenkorbProdukte.children[0]);
        }
        this.hideCart();

    }

    removeItem(id){
        cart = cart.filter(item => item.id !== id)
        this.SetCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled= false
        button.innerText = "Zum Warenkorb hinzufügen";
    }

    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id);
    }

}

//Produktauswahl speichern

class Storage{
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id ===id)
    }

    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    static getCart() {
        return localStorage.getItem('cart')?JSON.parse(
            localStorage.getItem('cart')):[]
        
    }

}



document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    ui.setupAPP();


    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
        
    })
    .then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    })

    

});