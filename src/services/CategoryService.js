import axios from 'axios'

const API_URL = 'http://localhost:5000/category/'

export const createCategory = async (categoryData) => {
    try {
        const response = await axios.post(API_URL + 'create', categoryData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
        return response.data
    } catch (error) {
        throw error
    }
}

export const getAllCategories = async () => {
    try {
        const response = await axios.get(API_URL)
        return response.data
    } catch (error) {
        throw error
    }
}
