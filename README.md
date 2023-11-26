# FreeChat Backend

FreeChat lets you chat with friends easily online - no need for complex signup or installing a separate phone app.

This is the backend code for the FreeChat app, which is currently deployed in test mode on [Vercel](https://chat-app-flowerco.vercel.app/)

## Tech stack

FreeChat is a React application built in JavaScript using Express for the backend server architecture.

Messages are sent via websockets using the Socket.io package, but are encrypted locally and not stored in the backend.

The Express server is connected to MongoDB for user and contact data storage. User image files are uploaded to Cloudinary for remote access.

## Getting started

After cloning chat-app-backend to a local repo, the following environment settings are required:

DATABASE_URL: The location of a remote MongoDB Atlas instance. Will default to 'mongodb://127.0.0.1:27017' if not set.

DATABASE_NAME: The name of the db in your MongoDB instance.

DATABASE_OPTIONS: Any options which you would like to specify for MongoDB, eg. retryWrites=true. Defaults to an empty string.

COOKIE_NAME: Choose a name for the authentication cookie.

JWT_SECRET: Specify the keyphrase to use when encoding and verifying the JWT used for session authorisation.

CORS_URL: Cross-Origin scripting is not allowed by default, as the code is ready for live deployment. This environment variable must be specified for the frontend to communicate with the backend when deployed. Defaults to localhost:3000.
