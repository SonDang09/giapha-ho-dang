# Model Schemas Reference

## Member Model
```javascript
{
  fullName: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female'], default: 'male' },
  generation: { type: Number, default: 1 },
  birthYear: Number,
  deathYear: Number,
  isDeceased: { type: Boolean, default: false },
  
  // Relationships
  parent: { type: ObjectId, ref: 'Member' },
  spouse: String,
  
  // Personal info
  occupation: String,
  biography: String,
  avatar: String,
  photos: [String],
  
  // Death anniversary
  deathDate: Date,
  lunarDeathDate: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

## SiteSettings Model
```javascript
{
  // Branding
  brandName: { type: String, default: 'Đặng Đức Tộc' },
  location: { type: String, default: 'Đà Nẵng - Việt Nam' },
  
  // Homepage
  siteTitle: { type: String, default: 'Gia Phả Họ Đặng' },
  tagline: { type: String, default: 'Uống nước nhớ nguồn' },
  heroDescription: String,
  
  // Tree page
  treeHeader: { type: String, default: 'GIA PHẢ HỌ ĐẶNG' },
  treeSubtitle: { type: String, default: 'Đà Nẵng - Việt Nam' },
  treeFooter: String,
  
  // SEO & Scripts
  headerScripts: String,
  
  // Footer & Contact
  footerText: String,
  contactEmail: String,
  contactPhone: String,
  
  // Social
  socialLinks: {
    facebook: String,
    zalo: String,
    youtube: String
  }
}
```

## User Model
```javascript
{
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // bcrypt hashed
  role: { 
    type: String, 
    enum: ['admin', 'admin_toc', 'user'], 
    default: 'user' 
  },
  fullName: String,
  email: String,
  createdAt: Date
}
```

## News Model
```javascript
{
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  content: String,
  summary: String,
  coverImage: String,
  author: { type: ObjectId, ref: 'User' },
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
  createdAt: Date
}
```

## Transaction Model
```javascript
{
  type: { type: String, enum: ['income', 'expense'] },
  amount: { type: Number, required: true },
  description: String,
  category: String,
  date: { type: Date, default: Date.now },
  member: { type: ObjectId, ref: 'Member' },
  createdBy: { type: ObjectId, ref: 'User' },
  createdAt: Date
}
```

## Album Model
```javascript
{
  title: { type: String, required: true },
  description: String,
  coverImage: String,
  photos: [{
    url: String,
    caption: String,
    uploadedAt: Date
  }],
  createdAt: Date
}
```
