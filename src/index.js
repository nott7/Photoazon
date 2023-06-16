import express from "express";
import session from "express-session";
import * as albums from "./album-routes.mjs";
import * as photos from "./routes-photos-album.mjs";
import * as users from "./users-routes.mjs";
const app = express();

app.use(express.json());
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    cookie: { maxAge: 9000000 },
  })
);

app.post("/users/signup", users.signUp);
app.post("/users/signin", users.signIn);
app.get("/users/signout", users.signOut);

app.get("/albums", albums.getAlbums);
app.get("/albums/search/name", albums.searchAlbumByName);
app.get("/albums/search/hashtag", albums.searchAlbumByHashtag);
app.post("/albums", albums.createAlbum);

app.get("/albums/:id", albums.getAlbum);
app.delete("/albums/:id", albums.deleteAlbum);
app.put("/albums/:id", albums.modifyAlbum);

app.get("/albums/:id/photos", photos.getPhotosFromAlbum);
app.post("/albums/:id/photos", photos.addPhotoToAlbum);

app.get("/albums/:ida/photos/:idp", photos.getPhotoFromAlbum);
app.delete("/albums/:ida/photos/:idp", photos.deletePhotoFromAlbum);
app.put("/albums/:ida/photos/:idp", photos.modifyPhotoFromAlbum);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
