import { Level } from 'level';

const db = new Level('../dist/db');

// 序列化函数
function serialize(data) {
    return JSON.stringify(data);
}

// 反序列化函数
function deserialize(data) {
    return JSON.parse(data);
}

// 插入数据
async function putData(key, data) {
    try {
        const serializedData = serialize(data);
        await db.put(key, serializedData);
        return true;
    } catch (err) {
        //console.error("Error", err);
        return false;
    }
}

// 获取数据
async function getData(key) {
    try {
        const data = await db.get(key);
        return deserialize(data);
    } catch (err) {
        // console.error("Error", err);
        return null;
    }
}

async function delData(key) {
    try {
        await db.del(key);
        return true;
    } catch (err) {
        //console.error("Error deleting data:", err);
        return false;
    }
}

// 更新数据
async function updateData(key, partialData, mergeFunction) {
    try {
        // 获取当前数据
        const currentData = await getData(key);
        if (currentData === null) {
            // 如果当前数据不存在，则无法更新，可以抛出错误或返回false
            throw new Error(`No data found for key: ${key}`);
        }

        // 使用提供的合并函数或默认合并逻辑来合并数据
        const mergedData = mergeFunction ? mergeFunction(currentData, partialData) : Object.assign({}, currentData, partialData);

        // 序列化合并后的数据并存储
        const serializedData = serialize(mergedData);
        await db.put(key, serializedData);
        return true;
    } catch (err) {
        //console.error("Error updating data:", err);
        return false;
    }
}

async function getKey(prefix) {
    try {
        const keys = [];
        const stream = db.keys({ gte: prefix, lt: prefix + '\uffff' });
        for await (const key of stream) {
            keys.push(key);
        }
        return keys;
    } catch (e) {
        console.log(e);
        return null;
    }
}
export {
    putData,
    getData,
    updateData,
    delData,
    getKey
}
