
const joinRoom = async (req, res) => {
  const chat = req.params.room;
  if (chat) {
    // Wait... there is no server redirection required. 
    // All of the chat processing will happen locally.
    // Do we even need a controller, or just to emit the socket broadcasts on calling the endpoint...?
  }
}