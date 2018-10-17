
const { db } = require('./database');

test('Checking db for database name match', () => {
  expect(db.config.database).toEqual("pomo_gitservice");  
});

test('Database host should equal localhost', () => {
  expect(db.config.host).toEqual("localhost");  
});

test('Username should be equal to root', () => {
  expect(db.config.username).toEqual("root");  
});

test('Model User should be built as function', () => {
  expect(db.models.user).toBeInstanceOf(Function);
});

test('Model Issues should be built as function', () => {
expect(db.models.issues).toBeInstanceOf(Function);
}); 

test('Model Repos should be built as function', () => {
expect(db.models.repos).toBeInstanceOf(Function);
}); 
