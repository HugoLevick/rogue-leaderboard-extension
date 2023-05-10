document.addEventListener("DOMContentLoaded", function () {
  // Find all elements with the class 'generic'
  let leaderboard = document.querySelector(".leaderboard-container");
  const main = document.querySelector("main");

  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      const playerElements = leaderboard.querySelectorAll(".player-data-row");
      // Create search html
      const searchContainer = document.createElement("div");
      const form = document.createElement("form");
      form.addEventListener("submit", searchPlayerInLeaderboard);

      form.innerHTML = `
      <input type
      <input placeholder="Search..." name="playerSearch">
      <button>Go!</button>
      &nbsp;&nbsp;&nbsp;
    <div>
        <label>
            <input type="radio" name="searchBy" value="name" checked>
            Search by name
        </label>
        <label>
            <input type="radio" name="searchBy" value="rank">
            Search rank
        </label>
    </div>

      `;

      searchContainer.appendChild(form);
      main.insertBefore(searchContainer, leaderboard);

      //First element is set to null so the players position is coherent with their rank
      const players = [];

      //Create players array
      for (const player in playerElements) {
        const element = playerElements[player];

        element.id = "playerRank#" + (+player + 1);

        if (element.childNodes?.length > 1) {
          const spanElement = element.childNodes[0];
          const pElement = element.childNodes[1];

          players.push({
            rank: +spanElement.innerHTML,
            username: pElement.innerHTML,
          });
        }
      }

      //Save array for use later
      sessionStorage.setItem("players", JSON.stringify(players));
    });
  });

  const observerOptions = {
    childList: true,
    subtree: true,
  };

  // Start observing the element for changes
  observer.observe(leaderboard, observerOptions);
});

//! Do NOT use single quotes
function searchPlayerInLeaderboard(event) {
  event.preventDefault();
  const searchInput = event.target.querySelector('input[name="playerSearch"]');
  let searchValue = searchInput.value;

  const searchType = event.target.querySelector(
    'input[name="searchBy"]:checked'
  ).value;

  if (searchType === "name") {
    searchValue = searchValue.toLowerCase();
    let { players } = sessionStorage;
    players = JSON.parse(players);

    for (const player of players) {
      if (player.username.toLowerCase() === searchValue) {
        const playerElement = document.getElementById(
          `playerRank#${player.rank}`
        );
        scrollToElement(playerElement);
        return;
      }
    }

    searchValue = searchValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchRegEx = new RegExp(`(.+)?${searchValue}(.+)?`, "i");
    const possiblePlayers = [];
    //Didnt find exact match
    for (const player of players) {
      if (player.username.match(searchRegEx)) {
        possiblePlayers.push(player);
      }
    }

    if (possiblePlayers.length > 0) {
      if (possiblePlayers.length === 1)
        scrollToElement(
          document.getElementById(`playerRank#${possiblePlayers[0].rank}`)
        );

      //Timeout to prevent alert from interfering with the scroll
      setTimeout(() => {
        alert(
          `Could not find an exact match, maybe you are looking for ${possiblePlayers
            .map((p) => p.username)
            .join(", ")}`
        );
      }, 1000);

      return;
    }

    alert("Player not found");
  } else if (searchType === "rank") {
    if (isNaN(searchValue) || searchValue < 1 || searchValue > 1000) {
      alert("Rank not valid");
      return;
    }
    const playerElement = document.getElementById(`playerRank#${searchValue}`);
    scrollToElement(playerElement);
    return;
  }
}

function scrollToElement(element) {
  element.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "start",
  });
}
