-- ====================================================
-- Chat Session Tables for User-Specific AI Assistant
-- ====================================================

USE Insight;
GO

-- Table to store chat sessions for each user
CREATE TABLE ChatSession (
    Session_ID INT IDENTITY(1,1) PRIMARY KEY,
    User_ID INT NOT NULL,
    Title NVARCHAR(300) NOT NULL,
    Created_At DATETIME NOT NULL DEFAULT GETDATE(),
    Updated_At DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (User_ID) REFERENCES [User](User_ID) ON DELETE CASCADE
);

-- Table to store messages within each chat session
CREATE TABLE ChatMessage (
    Message_ID INT IDENTITY(1,1) PRIMARY KEY,
    Session_ID INT NOT NULL,
    Role NVARCHAR(20) NOT NULL, -- 'user' or 'assistant'
    Content NVARCHAR(MAX) NOT NULL,
    Sources_Used INT NULL,
    Created_At DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (Session_ID) REFERENCES ChatSession(Session_ID) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX IX_ChatSession_UserID ON ChatSession(User_ID);
CREATE INDEX IX_ChatSession_UpdatedAt ON ChatSession(Updated_At DESC);
CREATE INDEX IX_ChatMessage_SessionID ON ChatMessage(Session_ID);
CREATE INDEX IX_ChatMessage_CreatedAt ON ChatMessage(Created_At);

GO

PRINT 'ChatSession and ChatMessage tables created successfully!';
