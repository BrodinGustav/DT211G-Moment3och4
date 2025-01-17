"use strict"
//Navigeringsmeny
let openBtn = document.getElementById("open-menu");
let closeBtn = document.getElementById("close-menu");

openBtn.addEventListener('click', toggleMenu);
closeBtn.addEventListener('click', toggleMenu);

function toggleMenu(){
    let navMenuEl = document.getElementById("nav-menu");

    let style = window.getComputedStyle(navMenuEl);

if(style.display === "none") {
    navMenuEl.style.display = "block";
}
else {
    navMenuEl.style.display = "none";
}
}

/*---------------------------------*/
//Funktioner för stapel och cirkeldiagram
//Hämta in data från Antagningsstatistik HT2023

async function fetchData(){
    try{
        const response = await fetch("https://studenter.miun.se/~mallar/dt211g/");
        const data = await response.json();
        displayStatistics(data); //Anropa funktion för kurser
        displayPrograms(data); //Anropa funktion för program
    }catch (error) {
        console.error('Error', error);
    }
    }

    fetchData();

//Funktion för att visa 6 mest sökta kurserna
function displayStatistics(data){
    //Filtrera ut kurser för HT2023
    const ht23Courses = data.filter(course => course.admissionRound === 'HT2023' && course.type === 'Kurs');

    //Sortera kurser baserat på antalet sökande
    const sortedCourses = ht23Courses.sort((a, b) => b.applicantsTotal - a.applicantsTotal);

    //Ta ut de 6 mest sökta kurserna
    const top6Courses = sortedCourses.slice(0, 6);

    //funktion för att skapa diagram
    createBarChart(top6Courses);
}

//Funktion för att visa 5 mest sökta programmen
function displayPrograms(dataPrograms){
    //Filtrera ut kurser för HT2023
    const ht23Programs = dataPrograms.filter(program => program.admissionRound === 'HT2023' && program.type === 'Program');

    //Sortera program baserat på antalet sökande
    const sortedPrograms = ht23Programs.sort((a, b) => b.applicantsTotal - a.applicantsTotal);

    //Ta ut de 5 mest sökta programmen
    const top5Programs = sortedPrograms.slice(0, 5);

    //funktion för att skapa diagram
    createCircleChart(top5Programs);
}

//stapeldiagram
function createBarChart(top6Courses) {
    const labels = top6Courses.map(course => course.name);
    const data = top6Courses.map(course => parseInt(course.applicantsTotal));


const canvas = document.getElementById('barChart');
const ctx = canvas.getContext('2d');

//Förstör befintligt diagram om det finns
if(window.myBarChart) {
    window.myBarChart.destroy();
}

window.myBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Antal sökande',
        data: data,
        borderWidth: 1
        }]  
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
}); 
}

//cirkeldiagram
function createCircleChart(top5Programs) {
    const labels = top5Programs.map(program => program.name);
    const data = top5Programs.map(program => parseInt(program.applicantsTotal)); //konverterar strängvärden från applicantsTotal till heltal

    const canvas = document.getElementById('pieChart');
    const ctx = canvas.getContext('2d'); //Möjliggör ritning av diagram på canvas. Utskrift fungerade inte utan denna.
    
    //Förstör befintligt diagram om det finns
    if(window.myPieChart) {
        window.myPieChart.destroy();
    }

    window.myPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: 'Antal sökande',
            data: data,
            borderWidth: 1,
            backgroundColor: ["yellow", "blue", "green", "purple", "orange"]        
        }]
        },
    });        
    }

    /*---------------------------------------------------------------------- */

    //Karta
    document.addEventListener('DOMContentLoaded', () => { 
    const map = L.map('map').setView([63.1766832, 14.636068099999989], 13); //Start pos Östersund (aka Världens hjärta)
    
    //tile layer från OpenStreetMap
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);


//Hantera sökanrop
document.getElementById("search-form").addEventListener("submit", (e) => {
    e.preventDefault(); 
    const query = document.getElementById("location-input").value;
    searchLocation(query);
});

function searchLocation(query) {
    fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const lat = data[0].lat;    //hänvisasr till första elementet i arrayen
                const lon = data[0].lon;
                placeMarker(lat, lon);
            }else{
                alert("Platsen kan inte hittas.");
            }
          })    
          .catch(error => console.error("Error", error));
        }


//Funktion för marker
function placeMarker(lat, lon) {
    const latitude = parseFloat(lat);   //Konverterar sträng till decimaltyp. Används då användar input är sträng
    const longitude = parseFloat(lon);
    

//Placera markör
L.marker([latitude, longitude]).addTo(map)
.bindPopup(`Plats: (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`)  //Visar 5 decimLER
.openPopup();

// Flytta kartan till den nya markörens position
map.setView([latitude, longitude], 13);
    
}
});