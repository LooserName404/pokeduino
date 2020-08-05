import { Board, LCD, Button } from "johnny-five";
import axios from "axios";

let api = axios.create({
  baseURL: 'https://pokeapi.co/api/v2/pokemon/'
});

interface Pokemon {
  name: string
  types: Array<any>
}

const board = new Board({
  port: 'COM6',
  repl: false,
  debug: false
});

board.on('ready', async () => {
  const lcd = new LCD({
    pins: [7, 8, 9, 10, 11, 12],
    // backlight: 6,
    rows: 2,
    cols: 16
  });

  const bPrev = new Button(3);
  const bNext = new Button(2);

  var pokemonId = 1;

  var col = 0;
  var typeString = '';

  board.loop(800, () => {
    if (col + lcd.cols > typeString.length) {
      col = 0;
      board.wait(2400, () => { });
    }
    lcd.cursor(0, 0).print(typeString.substr(col, col + lcd.cols));
    col++;
  });

  async function loadPokemon (pokemonId: number) {
    let response = await api.get(`${pokemonId}`);

    let pokemon = response.data;

    lcd.clear();

    let { name, types }: Pokemon = pokemon;

    typeString = `Types: ${types.reduce<string[]>((acc, type) => [...acc, type.type.name], []).join(', ').replace(/\b\w/g, c => c.toUpperCase())}`;

    col = 0;

    lcd.cursor(1, 0).print(`#${pokemonId} ${name.replace(/\b\w/g, c => c.toUpperCase())}`);
  }

  await loadPokemon(pokemonId);

  bPrev.on("press", async () => {
    if (pokemonId > 1) pokemonId--;
    await loadPokemon(pokemonId);
  });

  bNext.on("press", async () => {
    pokemonId++;
    await loadPokemon(pokemonId);
  });

});