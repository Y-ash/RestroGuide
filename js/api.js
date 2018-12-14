class ZOMATO{
    constructor(){
        this.api = '400087612dd7dda09327f3cd68465d0f';
        this.header = {
            method: 'GET',
            headers: {
                'user-key': this.api,
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
        }
    }

    async searchApi(city, categoryId){
        const categoryUrl = 'https://developers.zomato.com/api/v2.1/categories';

        //cityUrl
        const cityUrl = `https://developers.zomato.com/api/v2.1/cities?q=${city}`;

        //category data
        const categoryInfo = await fetch(categoryUrl, this.header);
        const categoryJson = await categoryInfo.json();
        const categories = await categoryJson.categories;

        //search City

        const cityInfo = await fetch(cityUrl, this.header);
        const cityJson = await cityInfo.json();
        const cityLocation = await cityJson.location_suggestions;

        let cityId = 0;

        if(cityLocation.length>0){
            cityId = cityLocation[0].id;
        }

        //Restraunt data

        const restaurantUrl = `https://developers.zomato.com/api/v2.1/search?entity_id=${cityId}&entity_type=city&category=${categoryId}&sort=rating`;
        const restrauntInfo = await fetch(restaurantUrl, this.header);
        const restaurantJson = await restrauntInfo.json();
        const restaurants = restaurantJson.restaurants;

        return {
            categories,
            cityId,
            restaurants
        };
    }
}

class UI{
    constructor(){
        this.loader = document.querySelector('.loader');
        this.restaurantList = document.getElementById('restaurant-list');
    }
    addSelectOptions(categories){
        const search = document.getElementById('searchCategory');
        let output = `<option value='0' selected>Select category</option>`;
        categories.forEach(category => {
            output += `<option value="${category.categories.id}">${category.categories.name}</option>`
        });
        search.innerHTML = output;
    }

    showFeedback(text){
        const feedback = document.querySelector('.feedback');
        feedback.classList.add('showItem');
        feedback.innerHTML = `<p>${text}</p>`;
        setTimeout(()=>{
            feedback.classList.remove('showItem');
        }, 2000)
    }

    showLoader(){
        this.loader.classList.add('showItem');
    }

    hideLoader(){
        this.loader.classList.remove('showItem');
    }

    getRestaurants(restaurants){
        this.hideLoader();
        if(restaurants.length === 0){
            this.showFeedback('No such category exist in the selected city!');
        }
        else{
            this.restaurantList.innerHTML = '';
            restaurants.forEach(restaurant =>{
                const {thumb: img, name, location: {address},user_rating:{aggregate_rating},
                cousines,average_cost_for_two:cost,menu_url, url} = restaurant.restaurant;

                if(img !== ''){
                    this.showRestaurant(img,name,address,aggregate_rating,cousines,cost,menu_url,url);
                }
            })
        }
    }

    showRestaurant(img, name,address,aggregate_rating,cousines,cost,menu_url,url){
        const div = document.createElement('div');
        div.classList.add('col-11', 'mx-auto', 'my-3','col-md-4');

        div.innerHTML = `<div class="card">
        <div class="card">
         <div class="row p-3">
          <div class="col-5">
           <img src="${img}" class="img-fluid img-thumbnail" alt="">
          </div>
          <div class="col-5 text-capitalize">
           <h6 class="text-uppercase pt-2 redText">${name}</h6>
           <p>${address}</p>
          </div>
          <div class="col-1">
           <div class="badge badge-success">
            ${aggregate_rating}
           </div>
          </div>
         </div>
         <hr>
         <div class="row py-3 ml-1">
          <div class="col-5 text-uppercase ">
           <p>cousines :</p>
           <p>cost for two :</p>
          </div>
          <div class="col-7 text-uppercase">
           <p>${cousines}</p>
           <p>${cost}</p>
          </div>
         </div>
         <hr>
         <div class="row text-center no-gutters pb-3">
          <div class="col-6">
           <a href="${menu_url}" target="_blank" class="btn redBtn  text-uppercase"><i class="fas fa-book"></i> menu</a>
          </div>
          <div class="col-6">
           <a href="${url}" target="_blank" class="btn redBtn  text-uppercase"><i class="fas fa-book"></i> website</a>
          </div>
         </div>
        </div>`;
        this.restaurantList.appendChild(div);
    }
}

(function(){
    const searchForm = document.getElementById('searchForm');
    const searchCity = document.getElementById('searchCity');
    const searchCategory = document.getElementById('searchCategory');

    const zomato = new ZOMATO();

    const ui = new UI();

    document.addEventListener("DOMContentLoaded", () =>{
        zomato.searchApi().then(data => ui.addSelectOptions(data.categories));
    });

    searchForm.addEventListener('submit', event => {
        event.preventDefault();
        const city = searchCity.value.toLowerCase();
        const categoryId = parseInt(searchCategory.value);
        if(city === '' || categoryId === 0){
            ui.showFeedback('Please Enter City and category!');
        }
        else{
            zomato.searchApi(city).then(cityData => {
                if(cityData.cityId === 0){
                    ui.showFeedback('Please Enter a valid City!');
                }
                else{
                    ui.showLoader();
                    zomato.searchApi(city, categoryId).then(data => {
                        ui.getRestaurants(data.restaurants);
                    });
                }
            })
        }
    })

})();