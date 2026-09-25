const formatResponse = (req, res, next) => {

  const originalSend = res.send;

  res.send = function (body) {

    if (body) {
      try {
        const parsedBody = JSON.parse(body);
        if (parsedBody.success !== undefined) {
           return originalSend.call(this, body);
        }

        const formattedBody = JSON.stringify({
          success: true,
          data: parsedBody
        });

        res.setHeader('Content-Type', 'application/json');
        return originalSend.call(this, formattedBody);
      } catch (e) {

        return originalSend.call(this, body);
      }
    }

    return originalSend.call(this, body);
  };

  res.success = (data, message) => {
    res.json({
      success: true,
      data,
      ...(message && { message })
    });
  };

  next();
};

module.exports = { formatResponse };
