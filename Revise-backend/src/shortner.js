import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();
export const longUrl = async (req, res) => {
  try {
    const { longurl } = req.body;
    const userId = req.user?.id; // ✅ retrieved from verifyAuth middleware

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // ✅ Check if URL already exists for this user
    const existingUrl = await prisma.Url.findFirst({
      where: {
        longurl,
        userId
      }
    });

    if (existingUrl) {
      return res.json({
        longurl: existingUrl.longurl,
        shorturl: existingUrl.shorturl,
        message: "URL already exists",
        existing: true
      });
    }

    const shortCode = nanoid(6);

    // ✅ Create LongUrl and connect existing user
    const result = await prisma.LongUrl.create({
      data: {
        longurl,
        user: {
          connect: { id: userId } // 👈 connect existing user
        },
        shorturl: {
          create: {
            shorturl: shortCode
          }
        }
      },
      include: {
        shorturl: true
      }
    });

    // ✅ Also store in Url model
    const res2 = await prisma.Url.create({
      data: {
        longurl,
        shorturl: shortCode,
        user: {
          connect: { id: userId }
        }
      }
    });

    res.json({
      longurl: result.longurl,
      shorturl: result.shorturl.shorturl,
      urlTable: {
        longurl: res2.longurl,
        shorturl: res2.shorturl
      },
      existing: false
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create short URL" });
  }
};



export const redirect = async (req, res) => {
  try {
    const shortCode = req.params.id;
    let longUrl = null;

    // Get from ShortUrl model with LongUrl relation
    const result = await prisma.ShortUrl.findUnique({
      where: { shorturl: shortCode },
      include: { longurl: true }
    });

    if (result && result.longurl) {
      longUrl = result.longurl.longurl;
    } else {
      // Get from flat Url model if not found in ShortUrl
      const result2 = await prisma.Url.findUnique({
        where: { shorturl: shortCode }
      });
      
      if (result2) {
        longUrl = result2.longurl;
      }
    }

    // If no URL found, return 404
    if (!longUrl) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    // Ensure the URL has a protocol (http/https)
    if (!longUrl.startsWith('http://') && !longUrl.startsWith('https://')) {
      longUrl = 'https://' + longUrl;
    }

    // Optional: Log the redirect for analytics
    console.log(`Redirecting ${shortCode} to ${longUrl}`);

    // Perform the actual redirect
    return res.redirect(301, longUrl);

  } catch (err) {
    console.error('Redirect error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Add these functions to your existing src/shortner.js file

// Get all URLs for the authenticated user
export const getUserUrls = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userUrls = await prisma.Url.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        id: 'desc' // Show newest first
      }
    });

    res.json(userUrls);
  } catch (err) {
    console.error("Error fetching user URLs:", err);
    res.status(500).json({ error: "Failed to fetch URLs" });
  }
};

// Delete a URL (only if it belongs to the user)
export const deleteUrl = async (req, res) => {
  try {
    const userId = req.user?.id;
    const urlId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Check if the URL belongs to the user
    const url = await prisma.Url.findFirst({
      where: {
        id: urlId,
        userId: userId
      }
    });

    if (!url) {
      return res.status(404).json({ message: "URL not found or doesn't belong to you" });
    }

    // Delete from both tables
    // First, find and delete related LongUrl entries
    const longUrls = await prisma.LongUrl.findMany({
      where: {
        longurl: url.longurl,
        userId: userId
      },
      include: {
        shorturl: true
      }
    });

    // Delete ShortUrl entries first (due to foreign key constraints)
    for (const longUrl of longUrls) {
      if (longUrl.shorturl) {
        await prisma.ShortUrl.delete({
          where: { id: longUrl.shorturl.id }
        });
      }
    }

    // Delete LongUrl entries
    await prisma.LongUrl.deleteMany({
      where: {
        longurl: url.longurl,
        userId: userId
      }
    });

    // Finally, delete from Url table
    await prisma.Url.delete({
      where: { id: urlId }
    });

    res.json({ message: "URL deleted successfully" });
  } catch (err) {
    console.error("Error deleting URL:", err);
    res.status(500).json({ error: "Failed to delete URL" });
  }
};


