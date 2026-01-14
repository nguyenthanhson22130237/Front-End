const API_KEY = "VbV3mAz7sRsG8V32QRA2hYTRDG0QPEuD";

export const getStickers = async () => {
    const res = await fetch(
        `https://api.giphy.com/v1/stickers/trending?api_key=${API_KEY}&limit=50`
    );
    const json = await res.json();
    return json.data;
};
