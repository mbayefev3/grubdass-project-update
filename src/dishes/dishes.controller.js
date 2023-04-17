const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function hasName(request, response, next) {
    const { data: { name } = {} } = request.body
    if (name) {
        next()
    } else {
        next({
            status: 400,
            message: "Dish must include a name"
        })
    }
}


function hasDescription(request, response, next) {
    const { data: { description } = {} } = request.body
    if (description) {
        next()
    } else {
        next({
            status: 400,
            message: "Dish must include a description"
        })
    }
}

function hasPrice(request, response, next) {
    const { data: { price } = {} } = request.body
    if (price === undefined || price === "") {
        next({
            status: 400,
            message: "Dish must include a price"
        })
    } else {
        next()
    }

}

function hasPriceGreaterThanZeroAndPositive(request, response, next) {
    const { data: { price } = {} } = request.body
    if (price <= 0) {
        next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0"
        })
    } else {
        next()
    }
}

function hasPriceNumberValue(request, response, next) {

    const { data: { price } = {} } = request.body
    if (Number.isInteger(price)) {
        next()
    } else {
        next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0"
        })
    }
}


function hasImageUrl(request, response, next) {
    const { data: { image_url } = {} } = request.body
    if (image_url) {
        next()
    } else {
        next({
            status: 400,
            message: "Dish must include a image_url"
        })
    }
}



function dishIdExists(request, response, next) {
    const { dishId } = request.params
    const getDish = dishes.find(({ id }) => dishId === id)
    if (getDish) {
        response.locals.getDish = getDish
        next()
    } else {
        next({
            status: 404,
            message: `Dish does not exist: ${dishId}`
        })
    }
}


function dishIdMatched(request, response, next) {
    const { dishId } = request.params
    const { data: { id } = {} } = request.body
    if (dishId !== id && id) {
        next({
            status: 400,
            message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
        })
    } else {
        next()
    }
}

function read(request, response, next) {
    const { getDish: data } = response.locals
    response.status(200).json({ data })
}


function list(request, response) {
    response.status(200).json({
        data: dishes
    })
}

function update(request, response, next) {

    const { data } = request.body
    const { getDish: { id } } = response.locals
    const updatedDish = {
        ...data,
        id
    }
    const getDishIdx = dishes.findIndex(({ id: dishId }) => dishId === id)
    dishes.splice(getDishIdx, 1, updatedDish)
    response.json({
        data: updatedDish
    })

}

function create(request, response) {
    const { data } = request.body
    const createdDish = {
        id: nextId(),
        ...data
    }
    dishes.push(createdDish)
    response.status(201).json({
        data: createdDish
    })
}








module.exports = {
    list,
    create: [hasName, hasDescription, hasPrice, hasPriceGreaterThanZeroAndPositive, hasPriceNumberValue, hasImageUrl, create],
    read: [dishIdExists, read],
    update: [dishIdExists, dishIdMatched, hasName, hasDescription, hasPrice, hasPriceGreaterThanZeroAndPositive, hasPriceNumberValue, hasImageUrl, update]
}