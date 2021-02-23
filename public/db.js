// Variable for storing data
let db;

// Sent data to indexedDB
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

// sent data on success request
request.onsuccess = function(event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  console.log("Something went wrong!" + event.target.errorCode);
};

function saveRecord(record) {
  // Create new transaction for rewrite
  const transaction = db.transaction(["pending"], "readwrite");

  // Access object
  const store = transaction.objectStore("pending");

  // Store it as new record
  store.add(record);
}

// Function that reads database and brings all data offline
function checkDatabase() {
  // Open new transaction 
  const transaction = db.transaction(["pending"], "readwrite");
  // Access new object
  const store = transaction.objectStore("pending");
  // Get all data in store
  const getAll = store.getAll();

  // Get method to pull all results and render them on front-end
  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        const transaction = db.transaction(["pending"], "readwrite");

          const store = transaction.objectStore("pending");
        
          // If no response, then clear
        store.clear();
      });
    }
  };
}

// Listen app on front-end when switching back to online mode
window.addEventListener("online", checkDatabase);