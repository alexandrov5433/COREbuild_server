export type UserData = {
    userID: number,
    is_employee: boolean,
    username: string,
    password: string,
    email: string | null,
    firstname: string | null,
    lastname: string | null,
    prefered_payment_method: 'paypal' | 'bank' | null,
    address: string | null,
    favorite_products: Array<number>,
    past_purchases: Array<number>
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
    pictures: Array<number>,
    reviews: Array<number>
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

export type ReviewData = {
    reviewID: number,
    rating: number,
    comment: string,
    reviewerID: number,
    time: bigint
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
    prefered_payment_method?: 'paypal' | 'bank' | null,
    address?: string | null,
    stayLoggedIn: boolean | null
}

export type CategoryData = {
    categoryID: number,
    name: string
}