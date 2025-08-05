FROM php:8.2-fpm

# Install system dependencies and PostgreSQL driver
RUN apt-get update && apt-get install -y \
    zip unzip curl libzip-dev libpng-dev libonig-dev libxml2-dev git libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring zip

# Install Node.js and npm
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

CMD ["php-fpm"]
