`CREATE TABLE Chats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  timestamp_utc TEXT,
  user_message TEXT,
  generated_sql TEXT,
  executed INTEGER DEFAULT 0, -- 0 = not executed/blocked, 1 = executed
  result_preview TEXT, -- small JSON or CSV sample of results
  assistant_summary TEXT,
  suggestion_text TEXT
);`


`CREATE TABLE Feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id INTEGER,
  feedback INTEGER, -- 1 = like, -1 = dislike
  feedback_text TEXT, -- optional user correction
  timestamp_utc TEXT,
  FOREIGN KEY(chat_id) REFERENCES Chats(id)
);`

`CREATE TABLE Resolutions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id INTEGER,
  corrected_sql TEXT,
  resolved_by TEXT, -- 'user' or 'admin' or 'agent'
  timestamp_utc TEXT
);`

