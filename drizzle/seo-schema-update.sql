-- SEO Management Tables

-- SEO Settings table for managing site-wide SEO configuration
CREATE TABLE IF NOT EXISTS seo_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  siteName VARCHAR(255) NOT NULL,
  siteDescription TEXT,
  siteKeywords TEXT,
  defaultMetaTitle VARCHAR(255),
  defaultMetaDescription VARCHAR(160),
  ogImage VARCHAR(500),
  twitterHandle VARCHAR(100),
  googleSiteVerification VARCHAR(255),
  bingSiteVerification VARCHAR(255),
  facebookPixelId VARCHAR(100),
  googleAnalyticsId VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Page SEO table for managing individual page SEO
CREATE TABLE IF NOT EXISTS page_seo (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pageUrl VARCHAR(500) NOT NULL UNIQUE,
  pageTitle VARCHAR(255),
  metaDescription VARCHAR(160),
  metaKeywords TEXT,
  canonicalUrl VARCHAR(500),
  ogTitle VARCHAR(255),
  ogDescription VARCHAR(160),
  ogImage VARCHAR(500),
  twitterTitle VARCHAR(255),
  twitterDescription VARCHAR(160),
  twitterImage VARCHAR(500),
  hreflang JSON,
  robots VARCHAR(100),
  indexable BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- SEO Analytics table for tracking keyword rankings and performance
CREATE TABLE IF NOT EXISTS seo_analytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pageUrl VARCHAR(500) NOT NULL,
  keyword VARCHAR(255),
  searchVolume INT,
  currentRanking INT,
  previousRanking INT,
  ctr DECIMAL(5, 2),
  impressions INT,
  clicks INT,
  trackedDate DATE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_tracking (pageUrl, keyword, trackedDate),
  FOREIGN KEY (pageUrl) REFERENCES page_seo(pageUrl) ON DELETE CASCADE
);

-- Backlink tracking table
CREATE TABLE IF NOT EXISTS backlinks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sourceUrl VARCHAR(500) NOT NULL,
  targetUrl VARCHAR(500) NOT NULL,
  anchorText VARCHAR(255),
  domain VARCHAR(255),
  domainAuthority INT,
  pageAuthority INT,
  nofollow BOOLEAN DEFAULT FALSE,
  status VARCHAR(50),
  discoveredDate DATE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_backlink (sourceUrl, targetUrl)
);

-- Broken links table for monitoring
CREATE TABLE IF NOT EXISTS broken_links (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sourceUrl VARCHAR(500) NOT NULL,
  brokenUrl VARCHAR(500) NOT NULL,
  statusCode INT,
  errorType VARCHAR(100),
  lastChecked TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_broken_link (sourceUrl, brokenUrl)
);

-- Create indexes for better query performance
CREATE INDEX idx_page_url ON page_seo(pageUrl);
CREATE INDEX idx_keyword ON seo_analytics(keyword);
CREATE INDEX idx_tracked_date ON seo_analytics(trackedDate);
CREATE INDEX idx_source_url ON backlinks(sourceUrl);
CREATE INDEX idx_target_url ON backlinks(targetUrl);
