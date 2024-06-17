import { colorPalettes } from "./colorPallettes";

const settingsDialog = document.getElementById("pallete-dialog");
const updateColors = document.getElementById("change-colors");
const list = document.getElementById("list-p");

for (let index = 0; index < colorPalettes.length; index++) {
    const pallete = colorPalettes[index];
    list.innerHTML += `<button class="btn" id="${index}">${pallete.emoji} ${pallete.name}</button>`
}

const handleClick = ({ target }) => {
    localStorage.setItem("colorPalleteIndex", target.id);
    settingsDialog.close();
}

list.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", handleClick);
});

updateColors.addEventListener("click", () => {
    settingsDialog.showModal();
});