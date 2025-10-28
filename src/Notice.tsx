import { clsx } from 'clsx';
import KeyCode from '@rc-component/util/lib/KeyCode';
import * as React from 'react';
import type { NoticeConfig } from './interface';
import pickAttrs from '@rc-component/util/lib/pickAttrs';

export interface NoticeProps extends Omit<NoticeConfig, 'onClose'> {
  prefixCls: string;
  className?: string;
  style?: React.CSSProperties;
  eventKey: React.Key;

  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onNoticeClose?: (key: React.Key) => void;
  hovering?: boolean;
}

const Notify = React.forwardRef<HTMLDivElement, NoticeProps & { times?: number }>((props, ref) => {
  const {
    prefixCls,
    style,
    className,
    duration = 4.5,
    showProgress,
    pauseOnHover = true,

    eventKey,
    content,
    closable,
    props: divProps,

    onClick,
    onNoticeClose,
    times,
    hovering: forcedHovering,
  } = props;
  const [hovering, setHovering] = React.useState(false);
  const [percent, setPercent] = React.useState(0);
  const [spentTime, setSpentTime] = React.useState(0);
  const mergedHovering = forcedHovering || hovering;
  const mergedShowProgress = duration && showProgress;

  // ======================== Close =========================
  const onInternalClose = () => {
    onNoticeClose(eventKey);
  };

  const onCloseKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === KeyCode.ENTER) {
      onInternalClose();
    }
  };

  // ======================== Effect ========================
  React.useEffect(() => {
    if (!mergedHovering && duration) {
      const start = Date.now() - spentTime;
      const timeout = setTimeout(
        () => {
          onInternalClose();
        },
        duration * 1000 - spentTime,
      );

      return () => {
        if (pauseOnHover) {
          clearTimeout(timeout);
        }
        setSpentTime(Date.now() - start);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, mergedHovering, times]);

  React.useEffect(() => {
    if (!mergedHovering && mergedShowProgress && (pauseOnHover || spentTime === 0)) {
      const start = performance.now();
      let animationFrame: number;

      const calculate = () => {
        cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame((timestamp) => {
          const runtime = timestamp + spentTime - start;
          const progress = Math.min(runtime / (duration * 1000), 1);
          setPercent(progress * 100);
          if (progress < 1) {
            calculate();
          }
        });
      };

      calculate();

      return () => {
        if (pauseOnHover) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, spentTime, mergedHovering, mergedShowProgress, times]);

  // ======================== Closable ========================
  const closableObj = React.useMemo(() => {
    if (typeof closable === 'object' && closable !== null) {
      return closable;
    }
    return {};
  }, [closable]);

  const ariaProps = pickAttrs(closableObj, true);

  // ======================== Progress ========================
  const validPercent = 100 - (!percent || percent < 0 ? 0 : percent > 100 ? 100 : percent);

  // ======================== Render ========================
  const noticePrefixCls = `${prefixCls}-notice`;

  return (
    <div
      {...divProps}
      ref={ref}
      className={clsx(noticePrefixCls, className, { [`${noticePrefixCls}-closable`]: closable })}
      style={style}
      onMouseEnter={(e) => {
        setHovering(true);
        divProps?.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHovering(false);
        divProps?.onMouseLeave?.(e);
      }}
      onClick={onClick}
    >
      {/* Content */}
      <div className={`${noticePrefixCls}-content`}>{content}</div>

      {/* Close Icon */}
      {closable && (
        <button
          className={`${noticePrefixCls}-close`}
          onKeyDown={onCloseKeyDown}
          aria-label="Close"
          {...ariaProps}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onInternalClose();
          }}
        >
          {closableObj.closeIcon ?? 'x'}
        </button>
      )}

      {/* Progress Bar */}
      {mergedShowProgress && (
        <progress className={`${noticePrefixCls}-progress`} max="100" value={validPercent}>
          {validPercent + '%'}
        </progress>
      )}
    </div>
  );
});

export default Notify;
