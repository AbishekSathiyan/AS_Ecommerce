// routes/contact.js
import express from "express";
import Contact from "../models/Contact.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Add this debug middleware to see all incoming requests
router.use((req, res, next) => {
  console.log(`📨 Contact Route: ${req.method} ${req.originalUrl}`);
  next();
});

// Create transporter with better configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

// Validate email function
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (optional field)
const isValidPhone = (phone) => {
  if (!phone) return true;
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Rate limiting storage
const rateLimit = new Map();

// Clean up rate limit every hour
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimit.entries()) {
    if (now - data.lastAttempt > 3600000) {
      rateLimit.delete(ip);
    }
  }
}, 3600000);

// Sanitize input function
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

// 📩 POST: Save contact + send auto-reply
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(name),
      email: sanitizeInput(email),
      phone: sanitizeInput(phone),
      subject: sanitizeInput(subject),
      message: sanitizeInput(message)
    };

    // Rate limiting check
    const now = Date.now();
    const clientData = rateLimit.get(clientIP);
    
    if (clientData && now - clientData.lastAttempt < 60000) {
      return res.status(429).json({ 
        success: false, 
        error: "Too many requests. Please try again in a minute." 
      });
    }

    rateLimit.set(clientIP, { lastAttempt: now });

    // Validation
    if (!sanitizedData.name || !sanitizedData.email || !sanitizedData.subject || !sanitizedData.message) {
      return res.status(400).json({ 
        success: false, 
        error: "All required fields (name, email, subject, message) must be filled." 
      });
    }

    if (!isValidEmail(sanitizedData.email)) {
      return res.status(400).json({ 
        success: false, 
        error: "Please provide a valid email address." 
      });
    }

    if (!isValidPhone(sanitizedData.phone)) {
      return res.status(400).json({ 
        success: false, 
        error: "Please provide a valid phone number." 
      });
    }

    if (sanitizedData.message.length < 10) {
      return res.status(400).json({ 
        success: false, 
        error: "Message must be at least 10 characters long." 
      });
    }

    if (sanitizedData.message.length > 1000) {
      return res.status(400).json({ 
        success: false, 
        error: "Message must not exceed 1000 characters." 
      });
    }

    if (sanitizedData.name.length > 100) {
      return res.status(400).json({ 
        success: false, 
        error: "Name must not exceed 100 characters." 
      });
    }

    // Check for duplicate submissions
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const duplicate = await Contact.findOne({
      email: sanitizedData.email,
      createdAt: { $gte: twentyFourHoursAgo },
      message: { $regex: sanitizedData.message.substring(0, 50), $options: 'i' }
    });

    if (duplicate) {
      return res.status(400).json({ 
        success: false, 
        error: "Similar message detected recently. Please wait 24 hours before submitting again." 
      });
    }

    // Generate ticket number
    const ticketNumber = `AS${Date.now().toString().slice(-6)}`;

    // Save contact in DB
    const newContact = new Contact({ 
      name: sanitizedData.name, 
      email: sanitizedData.email.toLowerCase(), 
      phone: sanitizedData.phone || undefined, 
      subject: sanitizedData.subject, 
      message: sanitizedData.message,
      ipAddress: clientIP,
      userAgent: req.get('User-Agent'),
      ticketNumber,
      status: 'new',
      read: false
    });
    
    await newContact.save();

    // Send emails in parallel
    const emailPromises = [];

    // Send user auto-reply
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      emailPromises.push(
        transporter.sendMail({
          from: `"AS Ecommerce Support" <${process.env.EMAIL_USER}>`,
          to: sanitizedData.email,
          subject: `✅ Thank you for contacting AS Ecommerce! [Ticket: ${ticketNumber}]`,
          html: `... your email template ...`
        }).catch(error => {
          console.error("Error sending user auto-reply:", error);
        })
      );
    }

    // Send admin notification
    if (process.env.ADMIN_EMAIL && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      emailPromises.push(
        transporter.sendMail({
          from: `"AS Ecommerce Alert System" <${process.env.EMAIL_USER}>`,
          to: process.env.ADMIN_EMAIL,
          subject: `📬 New Contact: ${sanitizedData.subject} [Ticket: ${ticketNumber}]`,
          html: `... your admin email template ...`
        }).catch(error => {
          console.error("Error sending admin notification:", error);
        })
      );
    }

    await Promise.allSettled(emailPromises);

    res.json({ 
      success: true, 
      message: "Message received successfully!", 
      ticketNumber,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error("Contact form save error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Server error. Please try again later." 
    });
  }
});

// 📋 GET ALL CONTACTS
router.get("/", async (req, res) => {
  try {
    console.log('🔍 GET /contact - Fetching all contacts');
    const contacts = await Contact.find().sort({ createdAt: -1 }).select('-__v');
    console.log(`✅ Found ${contacts.length} contacts`);
    res.json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error("❌ Error fetching contacts:", error);
    res.status(500).json({ success: false, error: "Failed to fetch contacts" });
  }
});

// 🗑️ DELETE CONTACT BY ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ DELETE /contact/:id - ID:', id);

    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        error: "Invalid contact ID format"
      });
    }

    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return res.status(404).json({
        success: false,
        error: "Contact not found"
      });
    }

    console.log('✅ Contact deleted successfully:', id);
    res.json({
      success: true,
      message: "Contact deleted successfully",
      data: {
        id: deletedContact._id,
        name: deletedContact.name,
        email: deletedContact.email,
        ticketNumber: deletedContact.ticketNumber
      }
    });

  } catch (error) {
    console.error("❌ Error deleting contact:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: "Invalid contact ID"
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to delete contact"
    });
  }
});

// 🔄 UPDATE CONTACT - FIXED VERSION
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { read, status } = req.body;

    console.log('🔄 PATCH /contact/:id');
    console.log('   ID:', id);
    console.log('   Body:', { read, status });
    console.log('   Full URL:', req.originalUrl);

    // Validate ID format
    if (!id || id.length !== 24) {
      console.log('❌ Invalid ID format');
      return res.status(400).json({
        success: false,
        error: "Invalid contact ID format"
      });
    }

    // Build update object
    const updateData = {};
    if (typeof read === 'boolean') {
      updateData.read = read;
    }
    if (status && ['new', 'in-progress', 'resolved', 'closed'].includes(status)) {
      updateData.status = status;
    }

    // If no valid fields to update
    if (Object.keys(updateData).length === 0) {
      console.log('❌ No valid fields to update');
      return res.status(400).json({
        success: false,
        error: "No valid fields to update. Provide 'read' (boolean) or 'status' (new, in-progress, resolved, closed)"
      });
    }

    console.log('📝 Update data:', updateData);

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true
      }
    ).select('-__v');

    if (!updatedContact) {
      console.log('❌ Contact not found in database');
      return res.status(404).json({
        success: false,
        error: "Contact not found"
      });
    }

    console.log('✅ Successfully updated contact:', updatedContact._id);
    console.log('   Updated data:', { 
      read: updatedContact.read, 
      status: updatedContact.status 
    });

    res.json({
      success: true,
      message: "Contact updated successfully",
      data: updatedContact
    });

  } catch (error) {
    console.error("❌ Error updating contact:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: "Invalid contact ID"
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: `Validation error: ${error.message}`
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update contact: " + error.message
    });
  }
});

// Also add PUT method as alternative to PATCH
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { read, status } = req.body;

    console.log('✏️ PUT /contact/:id');
    console.log('   ID:', id);
    console.log('   Body:', { read, status });

    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        error: "Invalid contact ID format"
      });
    }

    const updateData = {};
    if (typeof read === 'boolean') updateData.read = read;
    if (status && ['new', 'in-progress', 'resolved', 'closed'].includes(status)) {
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid fields to update"
      });
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!updatedContact) {
      return res.status(404).json({
        success: false,
        error: "Contact not found"
      });
    }

    console.log('✅ PUT - Successfully updated contact:', updatedContact._id);
    res.json({
      success: true,
      message: "Contact updated successfully",
      data: updatedContact
    });

  } catch (error) {
    console.error("❌ PUT Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update contact: " + error.message
    });
  }
});

export default router;