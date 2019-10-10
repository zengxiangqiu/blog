-- Expression Affinity	Column Declared Type
-- TEXT	"TEXT"
-- NUMERIC	"NUM"
-- INTEGER	"INT"
-- REAL	"REAL"
-- BLOB (a.k.a "NONE")	"" (empty string)

Drop TABLE IF EXISTS PostTmp;
CREATE TABLE  PostTmp AS SELECT * FROM Post;

Drop table Category;
Drop table Post;


CREATE TABLE Category(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
);

CREATE TABLE Post(
    id INTEGER PRIMARY Key AUTOINCREMENT,
    categoryId INTEGER,
    title TEXT,
    content TEXT,
    author TEXT,
    lastModDate TIMESTAMP DEFAULT CURRENT_DATE,
    
    CONSTRAINT Post_fk_categoryId FOREIGN KEY (categoryId)
    REFERENCES Category (id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TRIGGER [UpdateLastTime]
AFTER UPDATE
ON Post
FOR EACH ROW
BEGIN
UPDATE Post SET lastModDate = CURRENT_TIMESTAMP WHERE id = old.id;
END;


-- CREATE TABLE Post (id INTEGER PRIMARY KEY, categoryId INTEGER, title TEXT,
-- CONSTRAINT Post_fk_categoryId FOREIGN KEY (categoryId)
-- REFERENCES Category (id) ON UPDATE CASCADE ON DELETE CASCADE);
INSERT INTO Category(name)VALUES('ORDER'),('DELIVERYNOTE'),('FRANCHISE'),('WH');
-- INSERT INTO Category(name)VALUES('DELIVERYNOTE');
-- INSERT INTO Category(name)VALUES('FRANCHISE');
--INSERT INTO Post(categoryId, title,content,author)VALUES(2,'测试','TEXT','秋');
-- INSERT INTO Post(categoryId, title,content,author)VALUES(1,'11','11','秋')
INSERT INTO Post SELECT * FROM PostTmp;

-- SELECT * FROM Post WHERE categoryId = ?;
-- UPDATE Post Set title = ?, content = ?, categoryId = ? WHERE id = ?

--SELECT Category.id,COUNT(1) as qty,name as category FROM Post INNER JOIN Category ON categoryId = Category.id GROUP BY Category.id,name;

-- db.run("UPDATE Post Set title = ?, content = ?, categoryId = ? WHERE id = ?", "bar", 2);
