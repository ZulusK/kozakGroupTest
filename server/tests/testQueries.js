const httpStatus = require('http-status');

const testSuitsForUserPassword = {
  password: [
    {
      data: {
        password: null
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'empty'
    },
    {
      data: {
        password: 'a2!34'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: '< 8 symbols'
    },
    {
      data: {
        password: 'a234asakIHIBS!Ibi2i7iaih87xaixjnsscscscscsci'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: '> 20 symbols'
    },
    {
      data: {
        password: 'ADLassd23'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'without special symbols'
    },
    {
      data: {
        password: 'ADLNLWNOWN23!'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'without lowercase symbols'
    },
    {
      data: {
        password: 'asfsisib2b@k23k2k'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'without uppercase symbols'
    }
  ]
};
const testSuitsForUser = {
  username: [
    {
      data: {
        username: null
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'empty'
    },
    {
      data: {
        username: 'n'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: '< 2 symbols'
    },
    {
      data: {
        username: 'naaaaaaaaaaaaaaanaaaaaaaaaaaaaaa'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: '> 20 symbols'
    }
  ],
  mobileNumber: [
    {
      data: {
        mobileNumber: null
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'empty'
    },
    {
      data: {
        mobileNumber: '0500719822'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'no country code'
    },
    {
      data: {
        mobileNumber: '+10500719822'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'invalid country code'
    },
    {
      data: {
        mobileNumber: '+38050907198262'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'too match digits'
    },
    {
      data: {
        mobileNumber: '+38050071986'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'too little digits'
    }
  ],
  email: [
    {
      data: {
        email: 'invalid1'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'not a email'
    },
    {
      data: {
        email: null
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'empty'
    }
  ],
  password: [
    {
      data: {
        password: null
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'empty'
    },
    {
      data: {
        password: 'a2!34'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: '< 8 symbols'
    },
    {
      data: {
        password: 'a234asakIHIBS!Ibi2i7iaih87xaixjni'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: '> 20 symbols'
    },
    {
      data: {
        password: 'ADLassd23'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'without special symbols'
    },
    {
      data: {
        password: 'ADLNLWNOWN23!'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'without lowercase symbols'
    },
    {
      data: {
        password: 'asfsisib2b@k23k2k'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'without uppercase symbols'
    }
  ]
};

module.exports = {
  testSuitsForUser,
  testSuitsForUserPassword
};
