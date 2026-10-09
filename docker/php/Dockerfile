# PHP-Image für app (php-fpm), horizon und reverb
FROM php:8.4-fpm

ARG UID=1000
ARG GID=1000

COPY --from=mlocati/php-extension-installer:2 /usr/bin/install-php-extensions /usr/local/bin/
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

RUN apt-get update \
    && apt-get install -y --no-install-recommends git unzip \
    && rm -rf /var/lib/apt/lists/* \
    && install-php-extensions pdo_pgsql pgsql redis pcntl intl zip bcmath opcache

COPY docker/php/php.ini /usr/local/etc/php/conf.d/zz-teambrain.ini

# Container laufen mit der UID/GID des Hosts, damit Dateien im Bind-Mount nicht root gehören
RUN groupmod -o -g ${GID} www-data && usermod -o -u ${UID} -g www-data www-data \
    && mkdir -p /var/www/.composer && chown -R www-data:www-data /var/www

WORKDIR /var/www/html
USER www-data

CMD ["php-fpm"]
