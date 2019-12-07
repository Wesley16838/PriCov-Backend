const { GraphQLServer } = require('graphql-yoga')
const db = require('./db')
const dbf = db.dbfunction
const minf = db.miningfunction
const fs = require('fs')
const axios = require('axios')




const resolvers = {
    Query: {
      
        feed: async (parents, args, context, info) => {
            const out = await context.dbf.getAllUser();
            console.log('out in feed');
            console.log(out);
            return out;
        },
        finduser: async (parents, args, context, info) => {
            const target = await context.dbf.getuser(args.email)
            console.log('target in find user')
            console.log(target)
            return target;
        },
        getstat: async (parents, args, context, info) => {
            const inserted = await context.dbf.getstatistic()
            return inserted;
        }
    },
    Mutation: {
       
        adduser: async (parents, args, context, info) => {
            let out = await context.dbf.adduser(args.email)
            console.log('out in adduser');
            console.log(out);
            return out
        },
        addhistory: async (parents, args, context, info) => {
            let out = await context.dbf.addHistory(args.title, args.price, args.sale, args.url, args.img, args.user, args.keyword)
            console.log('out in addhistory');
            console.log(out);
            return out;
        },
        updateuser: async (parents, args, context, info) => {
            let out = await context.dbf.updateuser(args._id, args.email);
            console.log('out in updateuser');
            console.log(out);
            return out;
        },
        deleteuser: async (parents, args, context, info) => {
            let out = await context.dbf.deluser(args._id);
            console.log('out in deluser');
            console.log(out);
            return out;
        },
        webmine: async (parents, args, context, info) => {
            var response = await axios.get('http://localhost:3001/?keyword='+args.keyword)
            var arr = response.data.split('\n')
            console.log(arr)
            var user = await context.dbf.getuser(args.email)
            var todel = await context.dbf.delHistory(user._id.toString(),args.keyword)
            for(var x = 0 ; x < 20 ; x++){
                var obj = arr[x].split('\t')
                var addrd = await context.dbf.addHistory(obj[0],obj[1],obj[2],obj[3],obj[4],user._id.toString(),args.keyword);
            }
            return await context.dbf.getuser(args.email)
        }
    },
    User: {
        _id: (parents) => parents._id,
        email: (parents) => parents.email,
        History: async (parents, args, context, info) => {
            console.log("in user history")
            let out = await context.dbf.gethistorybyuser(parents._id);
            // console.log('out bef sort')
            // console.log(out)
            out.sort((a, b) => {
                var ca, cb;
                if (a.sale != 'NA') ca = a.sale;
                else ca = a.price;
                if (b.sale != 'NA') cb = b.sale;
                else cb = b.price;
                return parseInt(ca, 10) - parseInt(cb, 10);
            })
            console.log('out aft sort')
            console.log(out)
            return out;
        },
    },
    History: {
        _id: (parents) => parents._id,
        title: (parents) => parents.title,
        price: (parents) => parents.price,
        sale: (parents) => parents.sale,
        url: (parents) => parents.url,
        img: (parents) => parents.img,
        user: (parents) => parents.user,
        keyword: (parents) => parents.keyword,
    },
    Statistic: {
        _id: (parents) => parents._id,
        website: (parents) => parents.website,
        department: (parents) => {
            const data = parents.department;
            var out = new Array(0);
            for (s in data) {
                var obj = { name: s, amount: data[s] }
                out.push(obj);
            }
            console.log('in statistic')
            console.log(out)
            return out;
        }
    },
    Department: {
        name: (parents) => parents.name,
        amount: (parents) => parents.amount
    }
}

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
    context: { dbf: dbf },
})

server.start(() => console.log(`Server is running on http://localhost:4000`))