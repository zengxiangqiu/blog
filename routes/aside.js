const sqlite =require( 'sqlite');
const Promise =require( 'bluebird');
const dbPromise = sqlite.open('./database.sqlite', { Promise });

const getAsideAsync = async()=>{
    try
    {
        const db = await dbPromise;
        const categories = await db.all('SELECT Category.id,COUNT(1) as qty,name as category FROM Post INNER JOIN Category ON categoryId = Category.id GROUP BY Category.id,name;');
        return categories;
    }catch(err)
    {
    }      
};

module.exports={getAsideAsync} 