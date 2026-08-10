package com.ttg.orderservice.identity;

import org.springframework.core.MethodParameter;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

/**
 * Stand-in for authentication. Wiring real sessions or tokens is out of scope for the
 * exercise, so each client asserts who it is with a header and we take that at face
 * value. Replacing this resolver is the only change real auth would require.
 *
 * <p>A controller declares a {@link Customer} or {@link Staff} parameter to receive the
 * claimed identity. The parameter is null when the caller claims none: anonymous
 * requests are passed through rather than rejected, because which routes need which
 * principal is a per-route decision.
 */
public class IdentityArgumentResolver implements HandlerMethodArgumentResolver {

    public static final String CUSTOMER_HEADER = "X-Customer-Email";
    public static final String STAFF_HEADER = "X-Staff-Id";

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        Class<?> type = parameter.getParameterType();
        return type == Customer.class || type == Staff.class;
    }

    @Override
    public Object resolveArgument(MethodParameter parameter,
                                  ModelAndViewContainer mavContainer,
                                  NativeWebRequest request,
                                  WebDataBinderFactory binderFactory) {
        if (parameter.getParameterType() == Customer.class) {
            String email = request.getHeader(CUSTOMER_HEADER);
            return email != null ? new Customer(email) : null;
        }

        String staffId = request.getHeader(STAFF_HEADER);
        return staffId != null ? new Staff(staffId) : null;
    }
}
