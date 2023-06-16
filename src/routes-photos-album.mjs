import fs from "node:fs/promises";
import albums from "../db/albums.json" assert { type: "json" };

const DB_PATH = "./db/albums.json";

export const addPhotoToAlbum = async (req, res) => {
  const albumId = req.params.id;
  const album = albums[albumId];
  if (album && !album.cancelled && album.userId === req.session.user) { // se l'album esiste, non é cancellato e l'utente é quello che ha creato l'album
    let NEXT_PHOTO = Object.keys(album.photos).reduce( // uso la funzione reduce per trovare l'id della prossima foto
      (biggest, id) =>
        biggest > parseInt(id, 10) ? biggest : parseInt(id, 10),
      0
    );
    NEXT_PHOTO++; // incremento l'id della prossima foto
    const { name, hashtags } = req.body; // prendo i dati dalla richiesta
    const creationDate = new Date().toISOString();
    const modificationDate = new Date().toISOString();
    const photo = { // creo l'oggetto photo
      name,
      hashtags,
      creationDate,
      modificationDate,
    };
    album.photos[NEXT_PHOTO] = photo; // aggiungo la foto all'album
    await fs.writeFile(DB_PATH, JSON.stringify(albums, null, "  "));
    res.status(201).send({
      message: "photo added to album",
    });
  } else {
    res.status(200).send({
      data: {},
      error: true,
      message: "album not found",
    });
  }
};

export const deletePhotoFromAlbum = async (req, res) => {
  const albumId = req.params.ida;
  const photoId = req.params.idp;
  const album = albums[albumId];
  if (album && album.userId === req.session.user) { // se l'album esiste, non é cancellato e l'utente é quello che ha creato l'album
    if (album.photos[photoId] && !album.photos[photoId].cancelled) { // se la foto esiste e non é cancellata
      album.photos[photoId].cancelled = true; // cancello la foto
      await fs.writeFile(DB_PATH, JSON.stringify(albums, null, "  "));
      res.status(200).send({
        message: "photo removed from album",
      });
    } else {
      res.status(200).send({
        data: {},
        error: true,
        message: "photo not found",
      });
    }
  } else {
    res.status(200).send({ // se l'album non esiste o é cancellato
      data: {},
      error: true,
      message: "album not found",
    });
  }
};

export const modifyPhotoFromAlbum = async (req, res) => {
  const albumId = req.params.ida;
  const photoId = req.params.idp;
  const album = albums[albumId];
  if (album && !album.cancelled && album.userId === req.session.user) { // se l'album esiste, non é cancellato e l'utente é quello che ha creato l'album
    if (album.photos[photoId] && !album.photos[photoId].cancelled) { // se la foto esiste e non é cancellata
      const modificationDate = new Date().toISOString();
      album.photos[photoId] = {...album.photos[photoId], ...req.body, modificationDate}; // modifico la foto
      await fs.writeFile(DB_PATH, JSON.stringify(albums, null, "  "));
      res.status(200).send({
        message: "photo modified",
      });
    } else {
      res.status(200).send({
        data: {},
        error: true,
        message: "photo not found",
      });
    }
  } else {
    res.status(200).send({
      data: {},
      error: true,
      message: "album not found",
    });
  }
};

export const getPhotosFromAlbum = async (req, res) => {
  const albumId = req.params.id;
  const album = albums[albumId];
  if (album && !album.cancelled && album.userId === req.session.user) { // se l'album esiste, non é cancellato e l'utente é quello che ha creato l'album
    let allPhotos = Object.keys(album.photos).reduce((photos, id) => { // uso la funzione reduce per trovare le foto non cancellate
      if (!album.photos[id].cancelled) {
        photos[id] = album.photos[id];
      }
      return photos; // ritorno le foto non cancellate
    }, {});
    res.send({ photos: allPhotos }); 
  } else {
    res.status(200).send({
      data: {},
      error: true,
      message: "album not found",
    });
  }
};

export const getPhotoFromAlbum = async (req, res) => {
  const albumId = req.params.ida;
  const photoId = req.params.idp;
  const album = albums[albumId];
  if (album && !album.cancelled && album.userId === req.session.user) { // se l'album esiste, non é cancellato e l'utente é quello che ha creato l'album
    if (album.photos[photoId] && !album.photos[photoId].cancelled) { // se la foto esiste e non é cancellata
      res.send({ photo: album.photos[photoId] }); // ritorno la foto
    } else {
      res.status(200).send({
        data: {},
        error: true,
        message: "photo not found",
      });
    }
  } else {
    res.status(200).send({
      data: {},
      error: true,
      message: "album not found",
    });
  }
};
