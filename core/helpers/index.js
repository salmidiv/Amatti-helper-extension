import Model from './database.js';

// Post Model
class Post extends Model {
    user() {
        return this.belongsTo(User, 'user_id');
    }

    async getMockData(foreignKeyValue) {
        const data  =  [{
            id: 1, // This should be 1
            title: 'First Post',
            content: 'Hello World',
            user_id: 1 // This should match the user's ID
        }, {
            id: 2, // This should be 2
            title: 'Second Post',
            content: 'Another Post',
            user_id: 1 // This should also match the user's ID
        }];
        return data.filter(post => post.user_id === foreignKeyValue);
    }
}

// Role Model
class Role extends Model {
    users() {
        return this.belongsToMany(User, 'user_roles', 'role_id', 'user_id');
    }

    async getMockData() {
        return [{
            id: 1,
            name: 'admin'
        }];
    }
}

// User Model
class User extends Model {
    post() {
        return this.belongsTo(Post, 'post_id');
    }

    roles() {
        return this.belongsToMany(Role, 'user_roles', 'user_id', 'role_id');
    }

    async getMockData() {
        return [{
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            post_id: 1 // This should match the post's ID
        }];
    }
}

export { User, Post, Role };