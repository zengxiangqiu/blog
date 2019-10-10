const express = require('express');
const MarkdownIt = require('markdown-it');
const Promise =require( 'bluebird');
const sqlite =require( 'sqlite');

const router = express.Router();
const format = require('date-format');
const md = new MarkdownIt();
const dbPromise = sqlite.open('./database.sqlite', { Promise });

router.get('/edit/:id*?', async (req, res, next) => {
  try {
    const db = await dbPromise;
    var [post, categories,aside] = await Promise.all([
      db.get('SELECT * FROM Post WHERE id = ?', req.params.id),
      db.all('SELECT * FROM Category'),
      await getAside()
    ]);
    if(!post)
    {
    post = {title:'',id:'',content:'',categoryId:1};
    }
    res.render('post', { post, categories,asideContent:aside });
  } catch (err) {
    next(err);
  }
});

/* GET article page. */
router.get('/:id/:title*?',async function(req,res,next){
    var id = req.params.id;
    getPostById(id).then(post=>{
      post.content = md.render(post.content);
      return post;
    }).then(async post=>{
      await getAside().then(aside=>{
        res.render('article', { post,asideContent:aside});  
      });
    });
});

router.get('/',async function(req, res, next){
    var posts =getPostsAsync(req.query)
    .then(source =>{
        source.forEach(post=>{
            post.content = getSummaryFromDb(post.content);
            post.url = 'doc/'+post.id+'/'+ post.title.replace(/[ '.]+/g,'-').toLowerCase();
        });
        return source;
    }).then(async source=>{
      var asideContent = await getAside();
      res.render('articles',{title :'Document',posts:source,asideContent });
    });
});

router.post('/', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const post = req.body;
    if(post.id=="")
    {
      await InsertPost(post).then(id=>{
        res.redirect(req.baseUrl+'/'+id);
      });
    }
    else
    {
      await updatePost(post).then(id=>{
        res.redirect(req.baseUrl+'/'+id);
      });
    }
  } catch (err) {
    next(err);
  }
});

var getPostsAsync=(filter)=>{
    return new Promise(async(resolve, reject)=>{
        try
        {
            const db = await dbPromise;
            var sql = 'SELECT * FROM Post ';
            if(filter.category){
              sql +='WHERE categoryId = $categoryId';
            }
            const posts = await db.all(sql,{$categoryId:filter.category});
            resolve(posts);
        }catch(err)
        {
            console.log(err);
        }
    });
};

var getPostById=(id)=>{
  return new Promise(async(resolve,reject)=>{
    try
    {
      const db = await dbPromise;
      const post = db.get('SELECT * FROM Post WHERE id=?',id);
      resolve(post);
    }catch(err)
    {
      reject(err);
    }
  });
};

var updatePost=(post)=>{
  return new Promise(async(resolve,reject)=>{
    try
    {
      let db = await dbPromise;
      const modPost =  await db.run("UPDATE Post Set title = ?, content = ?, categoryId = ? WHERE id = ?"
      , [post.title
      , post.content
      , post.categoryId
      , post.id]
      ,)
      .then(err=>{
        resolve(post.id);
      })
      .catch(err=>{
        console.log(err);
      });
    }catch(err)
    {
      reject(err);
    }
  });
};

var InsertPost=(post)=>{
  return new Promise(async(resolve,reject)=>{
    try
    {
      var dd = format();
      const db = await dbPromise;
      const newPost = await db.run("INSERT INTO Post(categoryId, title,content,author,lastModDate)VALUES(?,?,?,?,?)"
      , [post.categoryId
      , post.title
      , post.content
      , '秋'
      , format()]
      );
      resolve(newPost.lastID);
    }catch(err)
    {
      reject(err);
    }
  });
};

const getSummaryFromDb = source=>{
    var data =  source;
    var content = md.render(data.toString());
    //content = /<article.*?>([\s\S]*)<\/article>/.exec(content)[1]
    var result = content.replace(/<\/?[^>]+(>|$)/g, '');
    result = text_truncate(result,200,'...');
    //console.log('Summary:'+result);
    return result;
};

const text_truncate = function(str, length, ending) {
    if (length == null) {
      length = 100;
    }
    if (ending == null) {
      ending = '...';
    }
    if (str.length > length) {
      return str.substring(0, length - ending.length) + ending;
    } else {
      return str;
    }
};

const getAside = async()=>{
    try
    {
      const db = await dbPromise;
      const categories = await db.all('SELECT Category.id,COUNT(1) as qty,name as category FROM Post INNER JOIN Category ON categoryId = Category.id GROUP BY Category.id,name;');
      return categories;
    }catch(err)
    {
    }      
};


module.exports = router;
