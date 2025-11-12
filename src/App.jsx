// App.jsx (fixed — includes CreatePostModal)
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import {
  useUser,
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
  UserButton,
} from "@clerk/clerk-react";

const SOCKET_URL = "https://game1-backend-ja8h.vercel.app";

// ---------- Header ----------
function Header({ user, onOpenSignIn, onOpenSignUp }) {
  return (
    <header className="w-full bg-green-600 bg-gradient-to-b from-green-600 to-green-700 shadow-sm px-6 py-4 flex items-center justify-between text-white">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold">
          SH
        </div>
        <h1 className="text-xl font-semibold tracking-wide">SPORTS HUB</h1>
      </div>

      <div className="flex items-center gap-3">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>

        <SignedOut>
          <button
            onClick={onOpenSignIn}
            className="px-4 py-2 rounded-md bg-white text-green-700 font-medium"
          >
            Log In
          </button>
          <button
            onClick={onOpenSignUp}
            className="px-4 py-2 rounded-md bg-green-800/30 border border-white/25"
          >
            Sign Up
          </button>
        </SignedOut>
      </div>
    </header>
  );
}

// ---------- Modal wrapper ----------
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl bg-white rounded-lg overflow-hidden shadow-xl">
        <div className="p-3 border-b flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded border hover:bg-gray-100"
          >
            Close
          </button>
        </div>
        <div className="p-4 flex justify-center">{children}</div>
      </div>
    </div>
  );
}

// ---------- Create Game Modal ----------
function CreateGameModal({ open, onClose, onCreate }) {
  const [location, setLocation] = useState("");
  const [sport, setSport] = useState("");
  const [time, setTime] = useState("");
  const [players, setPlayers] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!location.trim() || !sport.trim()) return;

    const newGame = {
      id: uuidv4(),
      title: `${sport} at ${location}`,
      sport: sport.trim(),
      time: time || "TBD",
      players: players || "Open",
    };

    onCreate(newGame);
    onClose();
    setLocation("");
    setSport("");
    setTime("");
    setPlayers("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="w-full max-w-lg bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3">Create Game</h3>
        <form onSubmit={submit} className="space-y-3">
          <input
            className="w-full px-3 py-2 border rounded"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <input
            className="w-full px-3 py-2 border rounded"
            placeholder="Game/Sport (e.g. Football)"
            value={sport}
            onChange={(e) => setSport(e.target.value)}
          />
          <input
            className="w-full px-3 py-2 border rounded"
            placeholder="Time (e.g. Tomorrow 7:30 AM)"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <input
            className="w-full px-3 py-2 border rounded"
            placeholder="Players Needed"
            value={players}
            onChange={(e) => setPlayers(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- Create Post Modal (RE-ADDED) ----------
function CreatePostModal({ open, onClose, onCreate, user }) {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!open) {
      setTitle("");
      setCaption("");
      setImageUrl("");
    }
  }, [open]);

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim() && !caption.trim()) return;
    const post = {
      id: uuidv4(),
      title: title.trim(),
      caption: caption.trim(),
      image: imageUrl.trim() || null,
      createdAt: new Date().toISOString(),
      author: {
        id: user?.id || "anon",
        name: user?.fullName || user?.username || "Anonymous",
      },
    };
    onCreate(post);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="w-full max-w-lg bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3">Create Post</h3>
        <form onSubmit={submit} className="space-y-3">
          <input
            className="w-full px-3 py-2 border rounded"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="w-full px-3 py-2 border rounded"
            placeholder="Image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <textarea
            className="w-full px-3 py-2 border rounded"
            placeholder="Caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- Left panel ----------
function LeftPanel({ games, onSelectGame, query, setQuery, onOpenCreateGame, onJoinToggle, joinedGames }) {
  return (
    <aside className="w-80 p-4 h-screen overflow-y-auto bg-white/60 backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search games or locations"
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          onClick={onOpenCreateGame}
          className="px-3 py-2 bg-green-600 text-white rounded"
        >
          +
        </button>
      </div>

      <div className="space-y-3">
        {games.length === 0 && <div className="text-gray-500">No upcoming games</div>}
        {games.map((g) => {
          const joined = joinedGames.includes(g._id || g.id);
          return (
            <div
              key={g._id || g.id}
              className="p-3 bg-gray-50 rounded shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => onSelectGame(g)}
            >
              <div className="font-semibold">{g.title}</div>
              <div className="text-xs text-gray-500">{g.sport} • {g.time || "TBD"}</div>
              <div className="text-xs text-gray-400 mb-2">Players: {g.players || "Open"}</div>

              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent selecting when clicking button
                  onJoinToggle(g._id || g.id);
                }}
                className={`px-3 py-1 text-sm rounded ${
                  joined
                    ? "bg-red-100 text-red-600 border border-red-300"
                    : "bg-green-100 text-green-700 border border-green-300"
                }`}
              >
                {joined ? "Leave" : "Join"}
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}


// ---------- Post card ----------
function PostCard({ post }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {post.image && <img src={post.image} alt={post.title || "post image"} className="w-full h-64 object-cover" />}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
            {post.author?.name?.[0] || "U"}
          </div>
          <div>
            <div className="font-semibold">{post.title || "Untitled"}</div>
            <div className="text-xs text-gray-500">{post.author?.name} • {new Date(post.createdAt).toLocaleString()}</div>
          </div>
        </div>
        <p className="mt-3 text-gray-700">{post.caption}</p>
      </div>
    </div>
  );
}

// ---------- Feed ----------
function CenterFeed({ posts, onOpenCreate }) {
  return (
    <main className="flex-1 p-6 h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Feed</h2>
        <button onClick={onOpenCreate} className="px-4 py-2 bg-green-600 text-white rounded">Create Post</button>
      </div>

      <div className="space-y-4">
        {posts.length === 0 && <div className="bg-white rounded-lg shadow p-6 text-gray-600">No posts yet — create the first post!</div>}
        {posts.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </main>
  );
}

// ---------- Chat ----------


function Chat({ socket, room, user, game }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  // 🟢 Listen for chat messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => setMessages((s) => [...s, msg]);
    const handleLoadMessages = (msgs) => setMessages(msgs);

    socket.on("chat_message", handleNewMessage);
    socket.on("load_messages", handleLoadMessages);

    return () => {
      socket.off("chat_message", handleNewMessage);
      socket.off("load_messages", handleLoadMessages);
    };
  }, [socket]);

  // 🧹 Clear messages when switching rooms
  useEffect(() => {
    if (!socket || !room) return; // wait until socket exists
    setMessages([]);
    socket.emit("join_room", room);
  }, [socket, room]);
  

  // 🔽 Auto-scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const payload = {
      id: uuidv4(),
      room,
      author: {
        id: user?.id || "anon",
        name: user?.fullName || user?.username || "Guest",
      },
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    socket.emit("chat_message", payload);
    setMessages((s) => [...s, payload]);
    setText("");
  };

  // 🟢 Dynamic chat title
  const chatTitle = game ? game.title : "Global Chat";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b font-semibold">{chatTitle}</div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-gray-400 text-center">Loading messages...</div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-xs md:max-w-md ${
                m.author?.id === (user?.id || "anon") ? "ml-auto text-right" : ""
              }`}
            >
              <div
                className={`inline-block px-3 py-2 rounded-lg ${
                  m.author?.id === (user?.id || "anon")
                    ? "bg-green-100"
                    : "bg-gray-100"
                }`}
              >
                <div className="text-sm">{m.text}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {m.author?.name} •{" "}
                  {new Date(m.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input box */}
      <form
        onSubmit={send}
        className="px-4 py-3 border-t flex items-center gap-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message..."
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          type="submit"
          className="px-3 py-2 bg-green-600 text-white rounded"
        >
          Send
        </button>
      </form>
    </div>
  );
}



// ---------- MainApp ----------

function MainApp({ user }) {
  const [socket, setSocket] = useState(null);
  const [posts, setPosts] = useState([]);
  const [games, setGames] = useState([]);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createGameOpen, setCreateGameOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [joinedGames, setJoinedGames] = useState([]);

  const API_URL = "https://game1-backend-ja8h.vercel.app/api"; // backend URL

  // Connect to socket.io
  useEffect(() => {
    const s = io(SOCKET_URL, { transports: ["websocket"] });
    setSocket(s);
    s.on("connect", () => console.log("✅ Connected to socket"));
    s.emit("join_room", "global_room");
    return () => s.disconnect();
  }, []);

  // 👉 Switch rooms when a game is selected
  useEffect(() => {
    if (!socket) return;

    const room = selectedGame ? selectedGame._id : "global_room";

    socket.emit("join_room", room);
    console.log("📡 Joined room:", room);

    return () => {
      socket.emit("leave_room", room);
      console.log("🚪 Left room:", room);
    };
  }, [selectedGame, socket]);

  // Fetch posts and games from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesRes, postsRes] = await Promise.all([
          axios.get(`${API_URL}/games`),
          axios.get(`${API_URL}/posts`),
        ]);
        setGames(gamesRes.data);
        setPosts(postsRes.data);
      } catch (err) {
        console.error("Error fetching:", err);
      }
    };
    fetchData();
  }, []);

  // Create Post (save to backend)
  const handleCreatePost = async (post) => {
    try {
      const res = await axios.post(`${API_URL}/posts`, post);
      setPosts((p) => [res.data, ...p]);
      socket?.emit("new_post", res.data);
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };

  // Create Game (save to backend)
  const handleCreateGame = async (game) => {
    try {
      const res = await axios.post(`${API_URL}/games`, game);
      setGames((g) => [res.data, ...g]);
    } catch (err) {
      console.error("Error creating game:", err);
    }
  };
  const handleJoinGame = (gameId) => {
    if (joinedGames.includes(gameId)) {
      // leave
      setJoinedGames(joinedGames.filter((id) => id !== gameId));
    } else {
      // join
      setJoinedGames([...joinedGames, gameId]);
    }
  };
  

  // Filter games (search)
  const filteredGames = games.filter((g) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      g.title.toLowerCase().includes(q) ||
      g.sport.toLowerCase().includes(q) ||
      (g.location && g.location.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex">
      <LeftPanel
      games={filteredGames}
      onSelectGame={setSelectedGame}
       query={query}
     setQuery={setQuery}
       onOpenCreateGame={() => setCreateGameOpen(true)}
      onJoinToggle={handleJoinGame}
      joinedGames={joinedGames}
/>


      <CenterFeed
        posts={posts}
        onOpenCreate={() => setCreateOpen(true)}
      />

      <aside className="w-96 p-4 h-screen bg-white border-l">
        <Chat
          socket={socket}
          room={selectedGame ? selectedGame._id : "global_room"}
          game={selectedGame}
          user={user}
        />
      </aside>

      {/* Modals */}
      <CreateGameModal
        open={createGameOpen}
        onClose={() => setCreateGameOpen(false)}
        onCreate={handleCreateGame}
      />
      <CreatePostModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreatePost}
        user={user}
      />
    </div>
  );
}

// ---------- Root App ----------
export default function App() {
  const { user } = useUser();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-green-50">
      <Header
        user={user}
        onOpenSignIn={() => setShowSignIn(true)}
        onOpenSignUp={() => setShowSignUp(true)}
      />

      <Modal open={showSignIn} onClose={() => setShowSignIn(false)}>
        <SignIn />
      </Modal>
      <Modal open={showSignUp} onClose={() => setShowSignUp(false)}>
        <SignUp />
      </Modal>

      <SignedOut>
        <div className="flex flex-col items-center justify-center h-screen text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Welcome to Sports Hub!
          </h2>
          <p className="mb-6 text-gray-600">
            Please log in or sign up to continue.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setShowSignIn(true)}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Log In
            </button>
            <button
              onClick={() => setShowSignUp(true)}
              className="px-4 py-2 border rounded"
            >
              Sign Up
            </button>
          </div>
        </div>
      </SignedOut>

      <SignedIn>{user && <MainApp user={user} />}</SignedIn>
    </div>
  );
}

// ---------- Sample Data ----------
function samplePosts() {
  return [
    {
      id: "p1",
      title: "Sunday Cricket Tournament",
      caption: "Friendly 7-a-side at Lakeside.",
      image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?q=80&w=1600",
      createdAt: new Date().toISOString(),
      author: { id: "u1", name: "Asha" },
      sport: "Cricket",
    },
  ];
}

function sampleGames() {
  return [
    {
      id: "g1",
      title: "Morning Football at Park",
      sport: "Football",
      time: "Oct 14, 7:30 AM",
      players: "6 needed",
    },
  ];
}
