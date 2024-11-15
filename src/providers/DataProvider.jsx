import React, {createContext, useContext, useEffect, useState} from 'react'
import {useUtils} from "/src/helpers/utils.js"
import {useEmails} from "/src/helpers/emails.js"
import {useURLParams} from "/src/route/ParamProvider"

const DataContext = createContext(null)
export const useData = () => useContext(DataContext)
const apiPath = "http://localhost:3000";
const {userId} = useURLParams;

const Status = {
    NOT_LOADED: 0,
    LOADED: 1
}

export const DataProvider = ({children}) => {
    const utils = useUtils()
    const emails = useEmails()

    const [status, setStatus] = useState(Status.NOT_LOADED)
    const [jsonData, setJsonData] = useState({
        settings: {},
        strings: {},
        sections: [],
        categories: []
    })
    const [dataValidated, setDataValidated] = useState(false)

    useEffect(() => {
        _load().then(r => {})
    }, [])

    useEffect(() => {
        if(!jsonData.settings)
            return

        if(!dataValidated) {
            _validate()
        }

        if(jsonData.settings['emailjs']) {
            emails.init(jsonData.settings['emailjs'])
        }
    }, [jsonData])

    const _load = async () => {
        const jSettings = await _requestAPI(`/settings/${userId}`);
        const jStrings = await _requestAPI(`/strings/${userId}`);
        const jStructure = await _requestAPI(`/structures/${userId}`);

        const categories = jStructure["categories"]

        const sections = jStructure["sections"]
       
        jSettings["supportedThemes"] = [
            {
                id: "dark",
                default: true,
                icon: "fa-solid fa-moon",
            },
            {
                id: "light",
                default: false,
                icon: "fa-solid fa-sun",
            },
        ];

        const filteredCategories = categories.filter(category => {
            return sections.find(section => section.categoryId === category.id)
        })

        setJsonData(prevState => ({
            ...prevState,
            settings: jSettings,
            strings: jStrings,
            categories: filteredCategories,
            sections: jStructure["sections"]
        }))

        setStatus(Status.LOADED)
    }

    const _validate = () => {
        const sections = jsonData.sections
        if(!sections.length) {
            return
        }

        setDataValidated(true)
    }

    const _loadJson = async (path) => {
        const actualPath = utils.resolvePath(path)
        const request = await fetch(actualPath)
        return request.json()
    }

    const _requestAPI = async (path) => {
        const request = await fetch(apiPath + path)
        return request.json();
    }

    const getSettings = () => {
        return jsonData.settings
    }

    const getStrings = () => {
        return jsonData.strings
    }

    const getSections = () => {
        return jsonData.sections
    }

    const getCategories = () => {
        return jsonData.categories
    }

    const getCategorySections = (category) => {
        if(!category)
            return []
        return jsonData.sections.filter(section => section["categoryId"] === category.id)
    }

    const listImagesForCache = () => {
        const settings = getSettings()
        const sections = getSections()

        const images = [
            utils.resolvePath(settings.profile['logoUrl']),
            utils.resolvePath(settings.profile['profilePictureUrl'])
        ]

        settings['supportedLanguages'].forEach(lang => {
            images.push(utils.resolvePath(lang['flagUrl']))
        })

        sections.forEach(section => {
            if(!section.content || !section.content.articles)
                return

            section.content.articles.forEach(article => {
                if(!article.items)
                    return

                article.items.forEach(item => {
                    if(!item.icon || !item.icon.img)
                        return

                    images.push(utils.resolvePath(item.icon.img))
                })
            })
        })

        return images
    }

    return (
        <DataContext.Provider value={{
            getSettings,
            getStrings,
            getSections,
            getCategories,
            getCategorySections,
            listImagesForCache
        }}>
            {status === Status.LOADED && dataValidated && (
                <>{children}</>
            )}
        </DataContext.Provider>
    )
}