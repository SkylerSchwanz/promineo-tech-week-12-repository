export { createGrocery, Grocery, icons };

const icons = {
  Carbohydrate: { icon: $(`<i class="col-icon fa-solid fa-wheat-awn" style="color:burlywood;"></i>`), color: '222, 184, 135' },
  Vegetable: { icon: $(`<i class="col-icon fa-solid fa-seedling" style="color: green;"></i>`), color: '0, 128, 0' },
  Fruit: { icon: $(`<i class="col-icon fa-solid fa-apple-whole" style="color:brown"></i>`), color: '65, 42, 42' },
  Meat: { icon: $(`<i class="col-icon fa-solid fa-drumstick-bite" style="color: chocolate;"></i>`), color: '210, 105, 30' },
  Fish: { icon: $(`<i class="col-icon fa-solid fa-fish" style="color:steelblue;"></i>`), color: '70, 130, 180' },
};

class Grocery {
  constructor(type, name, price) {
    this.type = type;
    this.name = name;
    this, (price = price);
  }
}

const createGrocery = function (id, type, FoodName, Price) {
  return `
    <div id="${id}" class="grocery" style="background-color: rgba(${icons[type].color}, 0.5);">

      <button class="type disabled-button" data-food-type="${type}">
        ${icons[type].icon.prop('outerHTML')}
      </button>

      <div class="name">
        <h1>
          ${FoodName}
        </h1>
      </div>

      <div class="price" style="display: flex; align-items: center; justify-content: center;">
        <h1 style=" width: fit-content; color: gray;">
          $${Price}
        </h1>
      </div>

      
      <button class="trash">
        <i class="col-icon fa-solid fa-recycle"></i>
      </button>

    </div>
  `;
};
