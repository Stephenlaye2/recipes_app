const cardRandom = document.querySelector(".card-random");
class HTTP {
  async getRandomMeal(url) {
    const response = await fetch(url);
    const resData = await response.json();

    return resData;
  }
  async searchMealByName(url) {
    const response = await fetch(url);
    const resData = await response.json();
    const meals = resData.meals;

    return meals;
  }
}

//  Instantiate HTTP class
const http = new HTTP();

// Get single random meal
function getSingleMeal() {
  http
    .getRandomMeal("https://www.themealdb.com/api/json/v1/1/random.php")
    .then((resData) => {
      const data = resData.meals[0];
      mealCard(data, true);
      console.log(data);
    })
    .catch((err) => {
      console.log(err);
    });
}
// Search meal by name

function searchByName() {
  const searchName = document.querySelector("#search").value;
  http
    .searchMealByName(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchName}`
    )
    .then((data) => {
      // Clean container
      cardRandom.innerHTML = "";
      if (data) {
        data.forEach((mealData) => {
          mealCard(mealData, false);
        });
      } else {
        if (document.querySelector(".alert")) {
          document.querySelector(".alert").innerHTML = "";
        }
        const div = document.createElement("div");
        div.className = "alert";
        const message = `${searchName} is not found, search different recipes`;
        div.appendChild(document.createTextNode(message));
        const container = document.querySelector(".container");
        container.insertBefore(div, cardRandom);
        setTimeout(() => {
          document.querySelector(".alert").remove();
          getSingleMeal();
        }, 3000);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

document.addEventListener("keypress", (e) => {
  if (e.key === "Enter" || e.code === "Enter") {
    searchByName();
    document.querySelector("#search").value = "";
  }
 
});
document.querySelector(".search-label").addEventListener("click", (e) => {
  searchByName();
  document.querySelector("#search").value = "";
  e.preventDefault();
});
function mealCard(data, random = false) {
  const card = document.createElement("div");
  card.classList.add("random-meal");
  card.id = `meal-${data.idMeal}`;
  card.innerHTML = `
    <h3 class="meal-title">${random ? "Random Recipes" : ""}</h3>
    <img src="${data.strMealThumb}" alt="${data.strMeal}" />
    <h4>${data.strMeal}</h4>
    <div class ="heart-icon">
    <i class="fa fa-heart"></i>
    </div>
  </div>`;

  cardRandom.appendChild(card);

  const allMealNodes = document.querySelectorAll(`#meal-${data.idMeal}`);
  const allmealArr = Array.from(allMealNodes);

  allmealArr.forEach((meal) => {
    showMeal();
    const image = meal.children[1];
    const target = meal.children[3];
    image.addEventListener("click", () => {
      mealInfo(data);
    });
    if (target) {
      target.addEventListener("click", (e) => {
        if (e.target.classList.contains("active")) {
          e.target.style.color = defaultStatus;
          deleteFromLS(data.idMeal);
          document.querySelector(`#meal-${data.idMeal}`).remove();
          e.target.classList.remove("active");
        } else {
          e.target.classList.add("active");
          e.target.style.color = "#fc03b6";
          storeInLS(data);
          showMeal();
        }
      });
    }
  });
}

showMeal();
function showMeal() {
  const data = getFromLS();
  const favThumbnail = document.querySelector(".card-favourite");
  let favourite = "";
  data.forEach((eachData) => {
    favourite += `
    <div class="fav-thumbnail" id="meal-${eachData.idMeal}" >
    <div>
      <img
        src="${eachData.strMealThumb}"
        alt=""
      />
      <i class="delete fa fa-remove"></i>
      </div>
      <p class="meal-name">${eachData.strMeal}</p>
    </div>
    `;
    deleteFromUI();
  });
  favThumbnail.innerHTML = favourite;

  data.forEach((eachData) => {
    const favMeal = document.querySelector(`#meal-${eachData.idMeal} `);
    if (favMeal) {
      const image = favMeal.children[0].firstElementChild;
      image.addEventListener("click", () => {
        mealInfo(eachData);
      });
    }
  });
}

function showHideFav() {
  const card = document.querySelector(".card");
  card.style.display = "none";
  document.querySelector(".show-hide-fav").addEventListener("click", (e) => {
    if (e.target.classList.contains("active")) {
      document.querySelector(".fav-btn").innerHTML =
        '<i class="fa fa-heart" style="color: #fff"></i> Show Favourite';
      card.style.display = "none";
      e.target.classList.remove("active");
    } else {
      card.style.display = "block";
      document.querySelector(".fav-btn").innerHTML =
        '<i class="fa fa-heart" style="color: #fc03b6"></i> Hide Favourite';
      e.target.classList.add("active");
    }
    e.preventDefault();
  });
}
function deleteFromLS(id) {
  const currentMeal = getFromLS();
  currentMeal.forEach((meal, index) => {
    if (meal.idMeal === id) {
      currentMeal.splice(index, 1);
    }
  });

  localStorage.setItem("meal", JSON.stringify(currentMeal));
}

function deleteFromUI() {
  document.querySelector(".card-favourite").addEventListener("click", (e) => {
    if (e.target.classList.contains("delete")) {
      const removeElement = e.target.parentElement.parentElement;
      removeElement.remove();
      const removeElementId = removeElement.id;
      const splitArr = removeElementId.split("-");
      const mealId = splitArr[1];
      deleteFromLS(mealId);
    }
    e.preventDefault();
  });
}
function storeInLS(data) {
  let meals;
  if (localStorage.getItem("meal") === null) {
    meals = [];
    meals.push(data);
    localStorage.setItem("meal", JSON.stringify(meals));
  } else {
    meals = JSON.parse(localStorage.getItem("meal"));
    meals.push(data);
    localStorage.setItem("meal", JSON.stringify(meals));
  }
}
function getFromLS() {
  let meals;
  if (localStorage.getItem("meal") === null) {
    meals = [];
  } else {
    meals = JSON.parse(localStorage.getItem("meal"));
  }
  return meals;
}

function mealInfo(data) {
  const mealInfoCard = document.querySelector(".meal-info-card");

  let prepList = [];
  for (let i = 1; i <= 20; i++) {
    if (data["strIngredient" + i]) {
      prepList.push(`${data["strIngredient" + i]} - ${data["strMeasure" + i]}`);
    } else {
      break;
    }
  }
  mealInfoCard.innerHTML = `

<div>
    <div>
<button><i class="delete fa fa-remove"></i></button>
<div>
      <div class="meal-info">
        <h3 class="meal-title">${data.strMeal}</h3>
        <img src="${data.strMealThumb}" alt="${data.strMeal}" />
        <div class="instruction">
        <h2>How To Prepare</h2>
        </div>
        <p class="instruction-body">${data.strInstructions}</p>
        <div class="instruction-list">
        <h3>Ingridients & Measurements</h3>
${prepList
  .map((prep) => {
    return `<li>${prep}</li>`;
  })
  .join("")}
        </div>
        
      </div>
      </div>
      </div>
      
`;
  const delBtn = document.querySelector(".meal-info-card .delete");
  mealInfoCard.style.position = "fixed";
  mealInfoCard.classList.remove("hidden");
  delBtn.addEventListener("click", () => {
    mealInfoCard.classList.add("hidden");
  });
}

showHideFav();
getSingleMeal();
