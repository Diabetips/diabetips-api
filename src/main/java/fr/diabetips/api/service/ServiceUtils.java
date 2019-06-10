package fr.diabetips.api.service;

import fr.diabetips.api.exception.ApiError;
import fr.diabetips.api.exception.ApiException;
import fr.diabetips.api.model.User;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.PropertyAccessorFactory;
import org.springframework.security.core.context.SecurityContextHolder;

import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;
import java.util.Set;
import java.util.StringJoiner;

class ServiceUtils {

    static User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User)
            return (User) principal;
        return null;
    }

    static boolean userHasAuthority(User u, String authority) {
        if (u == null)
            return false;
        return u.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals(authority));
    }

    static boolean currentUserHasAuthority(String authority) {
        return userHasAuthority(getCurrentUser(), authority);
    }

    static void copyProperties(Object src, Object dest, String... properties) {
        BeanWrapper srcWrap  = PropertyAccessorFactory.forBeanPropertyAccess(src);
        BeanWrapper destWrap = PropertyAccessorFactory.forBeanPropertyAccess(dest);
        destWrap.setAutoGrowNestedPaths(true);
        for (String prop : properties)
            destWrap.setPropertyValue(prop, srcWrap.getPropertyValue(prop));
    }

    static void copyNonNullProperties(Object src, Object dest, String... properties) {
        BeanWrapper srcWrap  = PropertyAccessorFactory.forBeanPropertyAccess(src);
        BeanWrapper destWrap = PropertyAccessorFactory.forBeanPropertyAccess(dest);
        destWrap.setAutoGrowNestedPaths(true);
        for (String prop : properties) {
            Object val = srcWrap.getPropertyValue(prop);
            if (val != null)
                destWrap.setPropertyValue(prop, val);
        }
    }

    static boolean isPropertyNonNull(Object obj, String... properties) {
        BeanWrapper wrap = PropertyAccessorFactory.forBeanPropertyAccess(obj);
        for (String prop : properties) {
            if (wrap.getPropertyValue(prop) == null)
                return false;
        }
        return true;
    }

    static <T> void validate(T obj) {
        Validator validator = Validation.buildDefaultValidatorFactory().getValidator();
        Set<ConstraintViolation<T>> violations = validator.validate(obj);
        if (!violations.isEmpty()) {
            StringJoiner joiner = new StringJoiner(", ");
            for (ConstraintViolation<T> violation : violations)
                joiner.add(violation.getMessage());
            throw new ApiException(ApiError.VALIDATION_ERROR, "Validation error: " + joiner.toString());
        }
    }

    static <T> void validate(T obj, String... properties) {
        Validator validator = Validation.buildDefaultValidatorFactory().getValidator();
        StringJoiner joiner = new StringJoiner(", ");
        for (String prop : properties) {
            Set<ConstraintViolation<T>> violations = validator.validateProperty(obj, prop);
            if (!violations.isEmpty()) {
                for (ConstraintViolation<T> violation : violations)
                    joiner.add(violation.getMessage());
            }
        }
        if (joiner.length() != 0)
            throw new ApiException(ApiError.VALIDATION_ERROR, "Validation error: " + joiner.toString());
    }

    static <T> void validateNonNull(T obj, String... properties) {
        BeanWrapper wrap = PropertyAccessorFactory.forBeanPropertyAccess(obj);
        Validator validator = Validation.buildDefaultValidatorFactory().getValidator();
        StringJoiner joiner = new StringJoiner(", ");
        for (String prop : properties) {
            if (wrap.getPropertyValue(prop) == null)
                continue;
            Set<ConstraintViolation<T>> violations = validator.validateProperty(obj, prop);
            if (!violations.isEmpty()) {
                for (ConstraintViolation<T> violation : violations)
                    joiner.add(violation.getMessage());
            }
        }
        if (joiner.length() != 0)
            throw new ApiException(ApiError.VALIDATION_ERROR, "Validation error: " + joiner.toString());
    }

}
