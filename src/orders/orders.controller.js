const path = require("path");

// // Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// // Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

function hasDeliverTo(request, response, next) {
    const { data: { deliverTo } = {} } = request.body
    if (deliverTo) {
        next()
    } else {
        next({
            status: 400,
            message: "Order must include a deliverTo"
        })
    }
}

function isStatusPending(request, response, next) {
    const { orderId } = request.params
    const { status } = orders.find(({ id }) => id === orderId)

    if (status !== "pending" && status) {
        next({
            status: 400,
            message: "cannot delete order with pending status"
        })
    } else {
        next()
    }
}
function hasMobileNumber(request, response, next) {
    const { data: { mobileNumber } = {} } = request.body
    if (mobileNumber) {
        next()
    } else {
        next({
            status: 400,
            message: "Order must include a mobileNumber"
        })
    }
}




function hasStatus(request, response, next) {
    const { data: { status } = {} } = request.body
    if (status) {
        next()
    } else {
        next({
            status: 400,
            message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
        })
    }
}

function validStatus(request, response, next) {
    const { data: { status } = {} } = request.body
    if (status === "delivered") {
        next({
            status: 400,
            message: "A delivered order cannot be changed"
        })
    } else {
        next()
    }
}
function isStatusInvalid(request, response, next) {
    const { data: { status } = {} } = request.body
    if (status === "invalid") {
        next({
            status: 400,
            message: "we cannot process order with status invalid"
        })
    } else {
        next()
    }
}



function isOrderIdMatchedBodyId(request, response, next) {
    const { data: { id } = {} } = request.body
    const { orderId } = request.params

    if (id !== orderId && id) {
        next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`
        })
    } else {
        next()
    }
}






function hasOrderId(request, response, next) {
    const { orderId } = request.params
    const order = orders.find(({ id }) => id === orderId)
    if (order) {
        response.locals.order = order
        next()
    } else {
        next({
            status: 404,
            message: `cannot find order id ${orderId}`
        })
    }
}



function hasDishesProperty(request, response, next) {
    const { data: { dishes } = {} } = request.body
    if (dishes) {
        next()
    } else {
        next({
            status: 400,
            message: "Order must include a dish"
        })
    }
}

function isDishesPropertyArray(request, response, next) {
    const { data: { dishes } = {} } = request.body
    if (Array.isArray(dishes) && dishes.length > 0) {
        next()
    } else {
        next({
            status: 400,
            message: "Order must include at least one dish"
        })
    }
}

function hasDishQuantity(request, response, next) {

    const { data: { dishes } = {} } = request.body

    const orderWithMissingDishQuantity = dishes.find(({ quantity }) => !quantity || !Number.isInteger(quantity) || quantity < 0)
    if (orderWithMissingDishQuantity) {
        const { id } = orderWithMissingDishQuantity
        next({
            status: 400,
            message: `Dish ${id} must have a quantity that is an integer greater than 0`
        })
    } else {
        next()
    }
}


function read(request, response, next) {
    const { order } = response.locals
    response.json({
        data: order
    })
}

function list(request, response) {
    response.json({
        data: orders
    })
}



function create(request, response, next) {
    const { data } = request.body
    const orderCreated = {
        id: nextId(),
        ...data
    }
    orders.push(orderCreated)
    response.status(201).json({
        data: orderCreated
    })
}


function update(request, response) {
    const { orderId } = request.params
    const { data } = request.body
    const updatedOrderIdx = orders.findIndex(({ id }) => id === orderId)
    const updatedOrder = {
        ...data,
        id: orderId
    }
    orders.splice(updatedOrderIdx, 1, updatedOrder)

    response.json({
        data: updatedOrder
    })
}


function destroy(request, response, next) {
    const { order: { id } } = response.locals
    const orderIdx = orders.findIndex(({ id: orderId }) => orderId === id)
    orders.splice(orderIdx, 1)
    response.status(204).send()
}

module.exports = {
    list,
    create: [hasDeliverTo, hasMobileNumber, hasDishesProperty, isDishesPropertyArray, hasDishQuantity, create],
    read: [hasOrderId, read],
    update: [hasOrderId, isOrderIdMatchedBodyId, hasStatus, isStatusInvalid, validStatus, hasDeliverTo, hasMobileNumber, hasDishesProperty, isDishesPropertyArray, hasDishQuantity, update],
    delete: [hasOrderId, isStatusPending, destroy]

}
