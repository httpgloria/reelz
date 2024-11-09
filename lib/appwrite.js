import {
  ID,
  Account,
  Client,
  Avatars,
  Databases,
  Query,
  Storage,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.gloria.aora",
  projectId: "665c972c000810e60add",
  databaseId: "665c9872003e6f4e5615",
  userCollectionId: "665c989b002021ca34df",
  videoCollectionId: "665c98cb000624a050aa",
  likeCollectionId: "672d81db002da27515b5",
  storageId: "665c9a23003d14708c37",
};

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videoCollectionId,
  likeCollectionId,
  storageId,
} = appwriteConfig;

// Init your React Native SDK
const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint) // Your Appwrite Endpoint
  .setProject(appwriteConfig.projectId) // Your project ID
  .setPlatform(appwriteConfig.platform); // Your application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw new Error();

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );

    console.log(newUser);

    return newUser;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const signIn = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);

    return session;
  } catch (error) {
    throw new Error(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
};

export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.orderDesc("$createdAt"),
    ]);

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.orderDesc("$createdAt"),
      Query.limit(4),
    ]);

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const searchPosts = async (type, query, user) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.search("title", query),
    ]);

    // console.log("appwrite type:", type);
    if (type == "home") {
      return posts.documents;
    } else {
      let likedPosts = posts.documents.filter((post) => {
        const found = post.liked.find((obj) => obj.$id == user.$id);
        return found !== undefined;
      });

      return likedPosts;
    }
  } catch (error) {
    throw new Error(error);
  }
};

export const getUserPosts = async (userId) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.equal("users", userId),
    ]);

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    throw new Error(error);
  }
};

export const getFilePreview = async (fileId, type) => {
  let fileUrl;

  try {
    if (type === "video") {
      fileUrl = storage.getFileView(storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        storageId,
        fileId,
        2000,
        2000,
        "top",
        100
      );
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
};

export const uploadFile = async (file, type) => {
  if (!file) return;

  const { mimeType, ...rest } = file;
  const asset = {
    name: file.fileName,
    type: file.mimeType,
    size: file.fileSize,
    uri: file.uri,
  };

  // console.log("asset", asset);

  try {
    const uploadedFile = await storage.createFile(
      storageId,
      ID.unique(),
      asset
    );

    // console.log("uploaded File", uploadedFile);

    const fileUrl = await getFilePreview(uploadedFile.$id, type);

    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
};

export const createVideo = async (form) => {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    const newPost = await databases.createDocument(
      databaseId,
      videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        users: form.userId,
      }
    );

    return newPost;
  } catch (error) {
    throw new Error(error);
  }
};

export const createLike = async (data) => {
  try {
    const newLike = await databases.createDocument(
      databaseId,
      likeCollectionId,
      ID.unique(),
      {
        videos: data.videoId,
        users: data.userId,
      }
    );

    return newLike;
  } catch (error) {
    throw new Error(error);
  }
};

export const deleteLike = async (documentId) => {
  try {
    await databases.deleteDocument(databaseId, likeCollectionId, documentId);
  } catch (error) {
    throw new Error(error);
  }
};

export const getLikes = async (userId) => {
  try {
    const likes = await databases.listDocuments(databaseId, likeCollectionId, [
      Query.equal("users", userId),
    ]);

    return likes.documents;
  } catch (error) {
    throw new Error(error);
  }
};
