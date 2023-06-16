import fs from "node:fs/promises";
import albums from "../db/albums.json" assert { type: "json" };

const DB_PATH = "./db/albums.json";

//TODO: usare luxon per avere le date con il fuso orario locale

let NEXT = Object.keys(albums).reduce(
  (biggest, id) => (biggest > parseInt(id, 10) ? biggest : parseInt(id, 10)),
  0
);

export const getAlbums = async (req, res) => {
  let allAlbums = Object.keys(albums).reduce((album, id) => {
    // Ho usato la funzione reduce per creare un nuovo oggetto con solo gli album non cancellati
    if (!albums[id].cancelled && albums[id].userId === req.session.user) {
       // se l'album non é cancellato e l'utente é quello che ha creato l'album, allora lo aggiungo all'oggetto album
      album[id] = albums[id];
    }
    return album;
  }, {});
  res.send(allAlbums); // invio l'oggetto album
};

export const getAlbum = async (req, res) => {
  const albumId = req.params.id;
  const album = albums[albumId];
  if (album && !album.cancelled && album.userId === req.session.user) {
    // se l'album esiste, non é cancellato e l'utente é quello che ha creato l'album, allora lo invio
    res.send({ album: album });
  } else {
    // altrimenti invio un messaggio di errore
    res.status(200).send({
      data: {},
      error: true,
      message: "album not found",
    });
  }
};

export const searchAlbumByName = async (req, res) => {
  const query = req.query.q; // ho usato .q perché uso la q come query string nella richiesta, non metto name perché é gia specificato nell'endpoint, stesso discorso
  // per searchAlbumByHashtag
  let filtered = Object.values(albums).filter(
    // ho usato la funzione filter per filtrare gli album in base al nome, se il nome dell'album include la query string e
    // non é cancellato allora lo aggiungo all'array filtered
    (a) => a.name.toLowerCase().includes(query.toLowerCase()) && !a.cancelled && a.userId === req.session.user
  );
  res.send(filtered); 
};

export const searchAlbumByHashtag = async (req, res) => {
  const query = req.query.q;
  console.log(query, req.session.user);
  let filtered = Object.values(albums).filter(
    (a) => a.hashtags.includes(query.toLowerCase()) && !a.cancelled && a.userId === req.session.user // Ho notato che quando faccio le richieste con postman non 
    //prende # nella query, quindi per fare le richieste ho usato %23 al posto di #
  );
  res.send(filtered);
};

export const createAlbum = async (req, res) => {
  NEXT++;

  const { name, hashtags } = req.body; // ho usato la destrutturazione per prendere i valori name e hashtags dal body della richiesta
  const creationDate = new Date().toISOString(); // Ho usato la funzione toISOString() per avere la data in formato ISO 8601, che mi permette di avere data e ora in formato UTC
  const modificationDate = new Date().toISOString();
  const userId = req.session.user; // ho usato la sessione per prendere l'id dell'utente che ha creato l'album
  const album = {  // creo l'oggetto album
    name,
    hashtags,
    creationDate,
    modificationDate,
    userId,
    photos: {},
  };

  albums[NEXT] = album;
  await fs.writeFile(DB_PATH, JSON.stringify(albums, null, "  "));
  res.status(201).send({
    message: "album created",
  });
};

export const deleteAlbum = async (req, res) => {
  const albumId = req.params.id;
  const album = albums[albumId];
  if (album && !album.cancelled && album.userId === req.session.user) { // se l'album esiste, non é cancellato e l'utente é quello che ha creato l'album, allora lo cancello
    albums[albumId].cancelled = true;
    await fs.writeFile(DB_PATH, JSON.stringify(albums, null, "  "));
    res.status(200).send({
      message: "album deleted",
    });
  } else {
    res.status(200).send({
      data: {},
      error: true,
      message: "album not found",
    });
  }
};

export const modifyAlbum = async (req, res) => {
  const albumId = req.params.id;
  const album = albums[albumId];
  if (album && !album.cancelled && album.userId === req.session.user) { // se l'album esiste, non é cancellato e l'utente é quello che ha creato l'album, allora lo modifico
    const modificationDate = new Date().toISOString(); 
    albums[albumId] = {...album, ...req.body, modificationDate}
    await fs.writeFile(DB_PATH, JSON.stringify(albums, null, "  "));
    res.status(200).send({
      message: "album modified",
    });
  } else {
    res.status(200).send({
      data: {},
      error: true,
      message: "album not found",
    });
  }
};
