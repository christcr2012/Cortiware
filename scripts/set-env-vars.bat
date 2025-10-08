@echo off
echo Setting Vercel Environment Variables for Cortiware
echo ==================================================
echo.

cd apps\provider-portal
echo Setting AUTH_TICKET_HMAC_SECRET for provider-portal...
echo 5f8bd6c4c819aa626b389cbf1e0c95c178b30e0fa27aedc016baaf22d6fa5a20 | vercel env add AUTH_TICKET_HMAC_SECRET production
echo 5f8bd6c4c819aa626b389cbf1e0c95c178b30e0fa27aedc016baaf22d6fa5a20 | vercel env add AUTH_TICKET_HMAC_SECRET preview
echo 5f8bd6c4c819aa626b389cbf1e0c95c178b30e0fa27aedc016baaf22d6fa5a20 | vercel env add AUTH_TICKET_HMAC_SECRET development
cd ..\..

cd apps\tenant-app
echo Setting AUTH_TICKET_HMAC_SECRET for tenant-app...
echo 5f8bd6c4c819aa626b389cbf1e0c95c178b30e0fa27aedc016baaf22d6fa5a20 | vercel env add AUTH_TICKET_HMAC_SECRET production
echo 5f8bd6c4c819aa626b389cbf1e0c95c178b30e0fa27aedc016baaf22d6fa5a20 | vercel env add AUTH_TICKET_HMAC_SECRET preview
echo 5f8bd6c4c819aa626b389cbf1e0c95c178b30e0fa27aedc016baaf22d6fa5a20 | vercel env add AUTH_TICKET_HMAC_SECRET development

echo Setting TENANT_COOKIE_SECRET for tenant-app...
echo 5f8b02b1c2523185a667082a2cdfce3bb633b0bc478b26c424d3bded47e72744 | vercel env add TENANT_COOKIE_SECRET production
echo 5f8b02b1c2523185a667082a2cdfce3bb633b0bc478b26c424d3bded47e72744 | vercel env add TENANT_COOKIE_SECRET preview
echo 5f8b02b1c2523185a667082a2cdfce3bb633b0bc478b26c424d3bded47e72744 | vercel env add TENANT_COOKIE_SECRET development

echo Setting PROVIDER_ADMIN_PASSWORD_HASH for tenant-app...
echo $2b$12$XYWtnQK8Z4GhYEKIGwvo5e5vhS6MkmVOPzUAWBlxLXlKDYMjqCsye | vercel env add PROVIDER_ADMIN_PASSWORD_HASH production
echo $2b$12$XYWtnQK8Z4GhYEKIGwvo5e5vhS6MkmVOPzUAWBlxLXlKDYMjqCsye | vercel env add PROVIDER_ADMIN_PASSWORD_HASH preview
echo $2b$12$XYWtnQK8Z4GhYEKIGwvo5e5vhS6MkmVOPzUAWBlxLXlKDYMjqCsye | vercel env add PROVIDER_ADMIN_PASSWORD_HASH development

echo Setting DEVELOPER_ADMIN_PASSWORD_HASH for tenant-app...
echo $2b$12$GTar80xmtoOUYxVCjVUN8OXgOzEDIuOZmq1CHUyjpfLPM667kT5bDu | vercel env add DEVELOPER_ADMIN_PASSWORD_HASH production
echo $2b$12$GTar80xmtoOUYxVCjVUN8OXgOzEDIuOZmq1CHUyjpfLPM667kT5bDu | vercel env add DEVELOPER_ADMIN_PASSWORD_HASH preview
echo $2b$12$GTar80xmtoOUYxVCjVUN8OXgOzEDIuOZmq1CHUyjpfLPM667kT5bDu | vercel env add DEVELOPER_ADMIN_PASSWORD_HASH development

echo Setting EMERGENCY_LOGIN_ENABLED for tenant-app...
echo false | vercel env add EMERGENCY_LOGIN_ENABLED production
echo false | vercel env add EMERGENCY_LOGIN_ENABLED preview
echo false | vercel env add EMERGENCY_LOGIN_ENABLED development

cd ..\..

echo.
echo All environment variables set successfully!
echo.
echo Next: Trigger redeployment in Vercel dashboard or run 'vercel --prod' in each app directory

