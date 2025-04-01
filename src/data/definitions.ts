export type UserData = {
    userID: number,
    is_employee: boolean,
    username: string,
    password: string,
    email: string | null,
    firstname: string | null,
    lastname: string | null,
    address: string | null,
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
    specsDocID: number | null,
    thumbnailID: number,
    pictures: Array<number>
}

export type ProductCreationData = {
    name: string,
    description: string,
    category: string,
    categoryID: number,
    price: number | string,
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
    price: number | string,
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
    paypal_order_id: string,
    shipping_speditor: string | null,
    shipment_tracking_code: string | null
}

export type OrderFiltrationOptions = {
    orderID: number | null,
    recipientID: number | null,
    shipping_status: 'pending' | 'shipped' | null,
    time: 'ascending' | 'descending' | null,
    currentPage: number,
    itemsPerPage: number
};

export type ShoppingCartData = {
    [key: number]: number
}

export type FavoriteData = {
    id: number,
    userID: number,
    products: Array<number>
}

export type NewProfileDetails = {
    email: string | null,
    firstname: string | null,
    lastname: string | null,
    address: string | null,
}

export type NewPasswordDetails = {
    currentPassword: string | null,
    newPassword: string | null
}

export type TicketData = {
    id: number,
    title: string,
    status: 'open' | 'closed',
    content_question: string,
    content_answer: string | null,
    time_open: number,
    time_close: number | null,
    email_for_answer: string,
    userID_submit: number | null,
    userID_employee: number | null
}

export type TicketCreationData = {
    title: string,
    content_question: string,
    time_open: number,
    email_for_answer: string,
    userID_submit: number | null
}

export type TicketAnswerData = {
    id: number,
    content_answer: string,
    time_close: number,
    userID_employee: number
}

export type TicketFiltrationOptions = {
    id: number | null,
    status: 'open' | 'closed' | null,
    time_open: 'ascending' | 'descending' | null,
    currentPage: number,
    itemsPerPage: number
};