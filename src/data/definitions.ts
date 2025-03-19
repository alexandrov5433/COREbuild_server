export type UserData = {
    userID: number,
    is_employee: boolean,
    username: string,
    password: string,
    email: string | null,
    firstname: string | null,
    lastname: string | null,
    address: string | null,
    favorite_products: Array<number>,
    shopping_cart: ShoppingCartData
}

export type ProductData = {
    productID: number,
    name: string,
    description: string,
    categoryID: number,
    price: number,
    stockCount: number,
    manufacturer: string,
    specsDocID: number,
    thumbnailID: number,
    pictures: Array<number>
}

export type ProductCreationData = {
    name: string,
    description: string,
    category: string,
    categoryID: number,
    price: number,
    stockCount: number,
    manufacturer: string,
    specsDocID: number,
    thumbnailID: number,
    pictures: Array<number>
}

export type ProductInfosEditingData = {
    name: string,
    description: string,
    category: string,
    categoryID: number,
    price: number,
    stockCount: number,
    manufacturer: string
}

export type ReviewData = {
    reviewID?: number,
    rating: number,
    comment: string,
    reviewerID: number,
    username?: string,
    time: number,
    isVerifiedPurchase: boolean,
    productID: number
}

export type FileData = {
    fileID: number,
    name: string
}

export type RegsiterData = {
    is_employee: string | null,
    username: string | null,
    password: string | null,
    repeat_password: string | null,
    authentication_code?: string | null,
    email?: string | null,
    firstname?: string | null,
    lastname?: string | null,
    address?: string | null,
    stayLoggedIn: boolean | null
}

export type CategoryData = {
    categoryID: number,
    name: string
}

export type ProductsCatalogQueryParams = {
    currentPage: number,
    itemsPerPage: number,
    name?: string,
    category?: string,
    priceFrom?: string,
    priceTo?: string,
    availableInStock?: string,
    manufacturer?: string,
}

export type ProductCatalogPagedResult = {
    pagesCount: number,
    currentPage: number,
    products: Array<ProductData>
}

export type OrderData = {
    id?: number,
    payment_status: 'pending' | 'paid',
    shipping_status: 'pending' | 'sent',
    content: ShoppingCartData,
    recipient: UserData['userID'],
    placement_time: number,
    total_price: number,
    paypal_order_id: string
}

export type ShoppingCartData = {
    [key: number]: number
}