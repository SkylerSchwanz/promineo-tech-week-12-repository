import { createGrocery, icons } from './handlers/grocery.js';

let CartColumn = $('#cart-column');
let RefreshGroceriesButton = $('#refresh-groceries-button button');

// Construct the full API endpoint URL with the dynamic port
const apiUrl = `http://localhost:3000/api/groceries`;

function calculateTotal() {
  let total = 0;
  CartColumn.find('.grocery').each((index, element) => {
    const foodPriceStr =
      $(element).find('.price input').val() ||
      $(element)
        .find('.price h1')
        .text()
        .replace(/[^0-9.]/g, '');
    const foodPrice = parseFloat(foodPriceStr);
    total += foodPrice;
  });
  return total; /*.toFixed(2); // Round to 2 decimal places for dollars and cents*/
}

function updateTotal() {
  const total = calculateTotal();
  $('#total span').text(`$${total}`);
}

const RefreshGroceries = function () {
  async function fetchGroceries() {
    return await $.get(apiUrl);
  }

  // Update the #total div
  updateTotal();

  CartColumn.empty();

  // Add a short delay before fetching the groceries
  setTimeout(() => {
    fetchGroceries().then((groceries) => {
      groceries.forEach((grocery) => {
        CartColumn.append(createGrocery(grocery.id, grocery.type, grocery.name, grocery.price));
      });
    });
  }, 100); // Adjust the delay time as needed (e.g., 100 milliseconds)
};

function updateGrocery(groceryId, formData) {
  const apiUrl = `http://localhost:3000/api/groceries/${groceryId}`;

  $.ajax({
    type: 'PUT',
    url: apiUrl,
    data: JSON.stringify(formData),
    contentType: 'application/json',
    success: function (response) {
      console.log(`Grocery item ${groceryId} updated successfully. | RESPONSE : ${JSON.stringify(response)}`);
    },
    error: function (error) {
      console.log(`Error updating grocery item ${groceryId}:`, error);
    },
  });
}

$(document).ready(function () {
  // Uncheck all radio buttons initially
  $('#food-buttons input[type="radio"]').prop('checked', false);

  // Refresh Groceries
  RefreshGroceries();

  // Handle the form submission event
  $('#item-creator').submit(function (event) {
    event.preventDefault(); // Prevent default form submission

    // Get the value of the currency field (string with currency symbols and commas)
    var currencyValue = $('#currency-field').val();
    // Get the type value of the grocery.
    var type = $('input[name="type"]:checked').val();
    // Get the name of the grocery.
    var name = $('#name').val();

    // Parse the currency field value to remove currency symbols and commas, and convert to integer
    var price = parseFloat(currencyValue.replace(/[$,]/g, ''), 10); // 10 specifies the radix

    // Create a JSON object for the form data
    var formData = {
      type: type,
      name: name,
      price: price,
    };

    // Make the AJAX POST request to your dynamic API endpoint
    $.ajax({
      type: 'POST',
      url: apiUrl,
      data: JSON.stringify(formData), // Convert formData to JSON string
      contentType: 'application/json', // Set content type to JSON
      success: function (response) {
        // Call createGrocery
        var groceryHTML = createGrocery(response.id, response.type, response.name, response.price);
        // Append grocery to container
        CartColumn.append(groceryHTML);
        // Handle the success response from the API if needed
        console.log('Success:', response);
        // Update Total
        updateTotal();
      },
      error: function (error) {
        // Handle the error response from the API if needed
        console.log('Error:', error);
      },
    });

    // Remove values from inputs
    $('#currency-field').val('');
    $('#food-buttons input[type="radio"]').prop('checked', false);
    $('#food-buttons label').removeClass('selected');
    $('#name').val('');
  });

  // Handle Refresh Button
  RefreshGroceriesButton.on('click', (event) => {
    event.preventDefault();
    RefreshGroceries();
  });
});

// Add event listener to food buttons
$('#food-buttons label').on('click', function () {
  // Remove 'selected' class from all buttons
  $('#food-buttons label').removeClass('selected');
  // Add 'selected' class to the clicked button
  $(this).addClass('selected');
});

// Add event listener to trash buttons
$(document).on('click', '.trash', function () {
  // Get the grocery ID from the parent div
  const groceryId = $(this).parent().attr('id');

  // Construct the API endpoint URL with the grocery ID
  const apiUrl = `http://localhost:3000/api/groceries/${groceryId}`;

  // Make the AJAX DELETE request to the API endpoint
  $.ajax({
    type: 'DELETE',
    url: apiUrl,
    success: function () {
      // Remove the grocery div from the column
      $(`#${groceryId}`).remove();
      // Update Total
      updateTotal();
    },
    error: function (error) {
      // Handle the error response from the API if needed
      console.log('Error:', error);
    },
  });
});

// Switch to Editing mode
$('#edit-groceries-button button').on('click', (event) => {
  event.preventDefault();
  $('#edit-groceries-button').css('display', 'none');
  $('#save-groceries-button').css('display', 'block');

  // Track the current index for each grocery item
  const currentIndexMap = new Map();

  // Iterate over each grocery item
  CartColumn.find('.grocery').each((index, element) => {
    const $grocery = $(element);
    const foodType = $grocery.data('food-type') ? $grocery.data('food-type').trim() : '';
    const foodName = $grocery.find('.name h1').text().trim();
    const foodPrice = $grocery.find('.price h1').text().replace('$', '').trim();

    // Convert the grocery header into an input field
    const inputField = $('<input type="text" style="color: grey; background-color: transparent; border: transparent;">');
    inputField.val(foodName);
    $grocery.find('.name h1').replaceWith(inputField);

    // Make the food type button clickable again
    const foodTypeButton = $grocery.find('.type');
    foodTypeButton.removeClass('disabled-button');
    foodTypeButton.prop('disabled', false);

    // Initialize the current index to 0 for each grocery item
    currentIndexMap.set($grocery.attr('id'), 0);

    // Handle the click event of the "type" button
    foodTypeButton.on('click', function () {
      const groceryId = $grocery.attr('id');
      const currentIndex = currentIndexMap.get(groceryId);
      const foodTypes = Object.keys(icons);
      const nextIndex = (currentIndex + 1) % foodTypes.length;
      const nextType = foodTypes[nextIndex];

      // Update the icon and background color for this grocery
      const icon = icons[nextType].icon.prop('outerHTML');
      const color = icons[nextType].color;
      $grocery.find('.type').data('food-type', nextType).html(icon);
      $grocery.css('background-color', `rgba(${color}, 0.5)`);

      // Update the current index for this grocery
      currentIndexMap.set(groceryId, nextIndex);
    });

    // Convert the grocery price into an input field
    const priceField = $('<input type="text" style="color: grey; background-color: transparent; border: transparent;">');
    priceField.val(foodPrice);
    $grocery.find('.price h1').replaceWith(priceField);
  });
});

// Return to Display mode
$('#save-groceries-button button').on('click', handleSaveGroceries);

function handleSaveGroceries(event) {
  event.preventDefault();
  $('#save-groceries-button').hide();
  $('#edit-groceries-button').show();

  CartColumn.find('.grocery').each((index, element) => {
    const $grocery = $(element);
    const groceryId = parseInt($grocery.attr('id'));
    const foodType = $grocery.find('.type').data('food-type').trim();
    const foodName = $grocery.find('.name input').val().trim();
    const foodPrice = parseFloat($grocery.find('.price input').val());

    // Check if food name or food price is different from the original value
    if (foodName !== $grocery.find('.name h1').text() || foodPrice !== $grocery.find('.price h1').text().replace('$', '')) {
      const formData = {
        type: foodType,
        name: foodName,
        price: foodPrice,
      };

      updateGrocery(groceryId, formData);
    } else {
      console.log(`Grocery item ${groceryId} has no changes.`);
    }
  });

  // Disable the food type buttons again
  $('.type').addClass('disabled-button').prop('disabled', true);
  RefreshGroceries();
}

// Update Total
updateTotal();
