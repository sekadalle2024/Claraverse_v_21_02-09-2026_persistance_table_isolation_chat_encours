/**
 * Clara Assistant Chat Window Component
 * 
 * This component serves as the main chat interface for the Clara assistant.
 * It displays the conversation history, handles message rendering, and manages
 * the chat window state including scrolling, loading states, and empty states.
 * 
 * Features:
 * - Message history display with virtualization for performance
 * - Smooth auto-scrolling like Claude/ChatGPT
 * - Loading states and indicators
 * - Empty state with welcome message
 * - Content chunking for large messages
 * - Message interaction handling
 * - Session management
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { 
  MessageCircle, 
  Sparkles, 
  FileText, 
  Image as ImageIcon, 
  Code,
  Search,
  Bot,
  ArrowDown,
  RefreshCw,
  Loader2,
  Brain,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Import logo from assets
import logo from '../../assets/logo.png';

// Import types and components
import { 
  ClaraMessage, 
  ClaraChatWindowProps,
  ClaraProcessingState
} from '../../types/clara_assistant_types';
import ClaraMessageBubble from './clara_assistant_message_bubble';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';

/**
 * Virtual scrolling configuration
 */
const VIRTUAL_CONFIG = {
  ESTIMATED_MESSAGE_HEIGHT: 150, // Estimated height per message in pixels
  BUFFER_SIZE: 5, // Number of extra messages to render above/below visible area
  CONTAINER_PADDING: 48, // Top/bottom padding in pixels
  SCROLL_DEBOUNCE: 16, // Scroll event debounce in ms (~60fps)
  OVERSCAN: 2 // Additional messages to render for smoother scrolling
};

/**
 * Content chunking configuration for large messages
 */
const CONTENT_CONFIG = {
  CHUNK_SIZE: 2000, // Characters per chunk
  INITIAL_CHUNKS: 2, // Number of chunks to show initially
  EXPAND_THRESHOLD: 5000, // Show "Show More" if content is longer than this
};

/**
 * Smooth auto-scroll configuration (Claude/ChatGPT style)
 */
const SCROLL_CONFIG = {
  STREAMING_INTERVAL: 100, // How often to auto-scroll during streaming (ms)
  SCROLL_DURATION: 300, // Duration of smooth scroll animation (ms)
  EASING: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Smooth easing function
  SCROLL_THRESHOLD: 100, // Pixels from bottom to consider "at bottom"
  STREAMING_DELAY: 50, // Delay before starting auto-scroll during streaming
};

/**
 * Virtual message item interface
 */
interface VirtualMessageItem {
  message: ClaraMessage;
  index: number;
  top: number;
  height: number;
  isVisible: boolean;
}

/**
 * Content chunk interface for large message content
 */
interface ContentChunk {
  id: string;
  content: string;
  isVisible: boolean;
}

/**
 * Chunked Message Content Component
 * Handles large content by breaking it into chunks
 */
const ChunkedMessageContent: React.FC<{
  message: ClaraMessage;
  userName?: string;
  isEditable?: boolean;
  onCopy?: (content: string) => void;
  onRetry?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
}> = ({ message, userName, isEditable, onCopy, onRetry, onEdit }) => {
  const [expandedChunks, setExpandedChunks] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  // Check if content needs chunking
  const needsChunking = message.content.length > CONTENT_CONFIG.EXPAND_THRESHOLD;
  
  // Create chunks if needed
  const chunks: ContentChunk[] = useMemo(() => {
    if (!needsChunking) {
      return [{
        id: `${message.id}-full`,
        content: message.content,
        isVisible: true
      }];
    }

    const chunkArray: ContentChunk[] = [];
    const content = message.content;
    
    for (let i = 0; i < content.length; i += CONTENT_CONFIG.CHUNK_SIZE) {
      const chunkContent = content.slice(i, i + CONTENT_CONFIG.CHUNK_SIZE);
      const chunkIndex = Math.floor(i / CONTENT_CONFIG.CHUNK_SIZE);
      
      chunkArray.push({
        id: `${message.id}-chunk-${chunkIndex}`,
        content: chunkContent,
        isVisible: chunkIndex < CONTENT_CONFIG.INITIAL_CHUNKS || showAll
      });
    }
    
    return chunkArray;
  }, [message.content, message.id, needsChunking, showAll]);

  // Handle expand/collapse
  const handleToggleExpand = useCallback(() => {
    setShowAll(!showAll);
  }, [showAll]);

  // For streaming messages, always show all content
  const isStreaming = message.metadata?.isStreaming;
  const chunksToShow = isStreaming || !needsChunking ? chunks : chunks.filter(chunk => chunk.isVisible);

  return (
    <div className="space-y-2">
      {/* Render visible chunks */}
      {chunksToShow.map((chunk, index) => (
        <div key={chunk.id} className={index > 0 ? "pt-2" : ""}>
          <ClaraMessageBubble
            message={{
              ...message,
              content: chunk.content,
              id: chunk.id
            }}
            userName={userName}
            isEditable={isEditable && index === 0} // Only first chunk is editable
            onCopy={onCopy}
            onRetry={index === 0 ? onRetry : undefined} // Only first chunk can retry
            onEdit={index === 0 ? onEdit : undefined} // Only first chunk can edit
          />
        </div>
      ))}
      
      {/* Show More/Less button */}
      {needsChunking && !isStreaming && (
        <div className="flex justify-center mt-3">
          <button
            onClick={handleToggleExpand}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show More ({Math.ceil((message.content.length - (CONTENT_CONFIG.INITIAL_CHUNKS * CONTENT_CONFIG.CHUNK_SIZE)) / CONTENT_CONFIG.CHUNK_SIZE)} more sections)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Virtualized Message List Component
 * Only renders visible messages plus a buffer for performance
 */
const VirtualizedMessageList: React.FC<{
  messages: ClaraMessage[];
  userName?: string;
  containerHeight: number;
  scrollTop: number;
  onMessageAction: (action: string, messageId: string, data?: any) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}> = ({ 
  messages, 
  userName, 
  containerHeight, 
  scrollTop, 
  onMessageAction,
  messagesEndRef 
}) => {
  const [measuredHeights, setMeasuredHeights] = useState<Map<string, number>>(new Map());
  const measurementRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const lastMeasurements = useRef<Map<string, number>>(new Map());

  // Debounce state updates to prevent rapid updates
  const debouncedSetHeights = useCallback(
    (newHeights: Map<string, number>) => {
      // Only update if heights have actually changed
      const hasChanges = Array.from(newHeights.entries()).some(([id, height]) => {
        const lastHeight = lastMeasurements.current.get(id);
        return lastHeight === undefined || lastHeight !== height;
      });

      if (hasChanges) {
        setMeasuredHeights(newHeights);
        // Update last measurements
        lastMeasurements.current = new Map(newHeights);
      }
    },
    []
  );

  // Measure message heights for more accurate virtualization
  const measureMessage = useCallback((messageId: string, element: HTMLDivElement | null) => {
    if (element) {
      measurementRefs.current.set(messageId, element);
      const height = element.offsetHeight;
      
      // Only update state if height has changed significantly
      const lastHeight = lastMeasurements.current.get(messageId);
      const heightDiff = lastHeight ? Math.abs(height - lastHeight) : Infinity;
      
      // Only update if height has changed by more than 2 pixels
      if (heightDiff > 2) {
        const newHeights = new Map(measuredHeights);
        newHeights.set(messageId, height);
        debouncedSetHeights(newHeights);
      }
    }
  }, [measuredHeights, debouncedSetHeights]);

  // Calculate virtual items with actual measured heights when available
  const virtualItems = useMemo((): VirtualMessageItem[] => {
    let currentTop = VIRTUAL_CONFIG.CONTAINER_PADDING;
    
    return messages.map((message, index) => {
      const measuredHeight = measuredHeights.get(message.id);
      // Increase estimated height for long messages
      const contentLength = message.content.length;
      const estimatedHeight = contentLength > CONTENT_CONFIG.EXPAND_THRESHOLD 
        ? Math.min(800, Math.max(VIRTUAL_CONFIG.ESTIMATED_MESSAGE_HEIGHT, contentLength / 10))
        : VIRTUAL_CONFIG.ESTIMATED_MESSAGE_HEIGHT;
      
      const height = measuredHeight || estimatedHeight;
      
      const item: VirtualMessageItem = {
        message,
        index,
        top: currentTop,
        height,
        isVisible: false
      };
      
      currentTop += height + 20; // 20px gap between messages
      return item;
    });
  }, [messages, measuredHeights]);

  // Calculate total height for scrollbar
  const totalHeight = virtualItems.length > 0 
    ? virtualItems[virtualItems.length - 1].top + virtualItems[virtualItems.length - 1].height + VIRTUAL_CONFIG.CONTAINER_PADDING
    : VIRTUAL_CONFIG.CONTAINER_PADDING * 2;

  // Determine which messages are visible
  const visibleItems = useMemo(() => {
    const visibleTop = scrollTop;
    const visibleBottom = scrollTop + containerHeight;
    
    return virtualItems.filter(item => {
      const itemBottom = item.top + item.height;
      return itemBottom >= visibleTop - (VIRTUAL_CONFIG.BUFFER_SIZE * VIRTUAL_CONFIG.ESTIMATED_MESSAGE_HEIGHT) &&
             item.top <= visibleBottom + (VIRTUAL_CONFIG.BUFFER_SIZE * VIRTUAL_CONFIG.ESTIMATED_MESSAGE_HEIGHT);
    });
  }, [virtualItems, scrollTop, containerHeight]);

  // Message action handlers
  const handleCopyMessage = useCallback((content: string) => {
    onMessageAction('copy', '', content);
  }, [onMessageAction]);

  const handleRetryMessage = useCallback((messageId: string) => {
    onMessageAction('retry', messageId);
  }, [onMessageAction]);

  const handleEditMessage = useCallback((messageId: string, newContent: string) => {
    onMessageAction('edit', messageId, newContent);
  }, [onMessageAction]);

  return (
    <div style={{ height: totalHeight, position: 'relative' }}>
      {visibleItems.map(({ message, top, height }) => (
        <div
          key={message.id}
          style={{
            position: 'absolute',
            top: top,
            left: 0,
            right: 0,
            minHeight: height
          }}
          ref={(el) => measureMessage(message.id, el)}
        >
          <div className="mb-5">
            <ClaraMessageBubble
              message={message}
              userName={userName}
              isEditable={message.role === 'user'}
              onCopy={handleCopyMessage}
              onRetry={handleRetryMessage}
              onEdit={handleEditMessage}
            />
          </div>
        </div>
      ))}
      
      {/* Messages end marker */}
      <div 
        ref={messagesEndRef}
        style={{
          position: 'absolute',
          top: totalHeight - VIRTUAL_CONFIG.CONTAINER_PADDING,
          height: 1,
          width: '100%'
        }}
      />
    </div>
  );
};

/**
 * Smooth Auto-Scroll Engine (Claude/ChatGPT Style)
 * Provides butter-smooth scrolling experience
 */
class SmoothAutoScroller {
  private container: HTMLElement | null = null;
  private target: HTMLElement | null = null;
  private isScrolling = false;
  private lastScrollTime = 0;
  private streamingInterval: NodeJS.Timeout | null = null;
  private pendingScroll = false;

  constructor(container: HTMLElement | null, target: HTMLElement | null) {
    this.container = container;
    this.target = target;
  }

  updateRefs(container: HTMLElement | null, target: HTMLElement | null) {
    this.container = container;
    this.target = target;
  }

  private isNearBottom(): boolean {
    if (!this.container) return false;
    const { scrollTop, scrollHeight, clientHeight } = this.container;
    return scrollHeight - scrollTop - clientHeight < SCROLL_CONFIG.SCROLL_THRESHOLD;
  }

  private smoothScrollToBottom(duration = SCROLL_CONFIG.SCROLL_DURATION): Promise<void> {
    return new Promise((resolve) => {
      if (!this.container || this.isScrolling) {
        resolve();
        return;
      }

      this.isScrolling = true;
      const startTime = performance.now();
      const startScrollTop = this.container.scrollTop;
      const targetScrollTop = this.container.scrollHeight - this.container.clientHeight;
      const distance = targetScrollTop - startScrollTop;

      // Don't scroll if already at bottom
      if (Math.abs(distance) < 5) {
        this.isScrolling = false;
        resolve();
        return;
      }

      const animate = (currentTime: number) => {
        if (!this.container) {
          this.isScrolling = false;
          resolve();
          return;
        }

        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing function (cubic-bezier)
        const easeProgress = this.cubicBezier(0.25, 0.46, 0.45, 0.94, progress);
        
        const currentScrollTop = startScrollTop + (distance * easeProgress);
        this.container.scrollTop = currentScrollTop;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.isScrolling = false;
          this.lastScrollTime = currentTime;
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  private cubicBezier(x1: number, y1: number, x2: number, y2: number, t: number): number {
    // Simplified cubic bezier calculation
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;
    
    const cubeT = t * t * t;
    const squareT = t * t;
    
    return ay * cubeT + by * squareT + cy * t;
  }

  // For new messages - immediate smooth scroll
  scrollToNewMessage(): void {
    if (!this.isNearBottom()) return;
    
    // Cancel any existing streaming scroll
    this.stopStreamingScroll();
    
    // Add slight delay to let message render
    setTimeout(() => {
      this.smoothScrollToBottom(SCROLL_CONFIG.SCROLL_DURATION);
    }, 50);
  }

  // For streaming content - gradual continuous scrolling
  startStreamingScroll(): void {
    if (this.streamingInterval) return;
    
    this.streamingInterval = setInterval(() => {
      if (!this.isNearBottom()) {
        this.stopStreamingScroll();
        return;
      }
      
      // Gentle continuous scroll during streaming
      if (!this.isScrolling) {
        this.smoothScrollToBottom(SCROLL_CONFIG.STREAMING_INTERVAL + 50);
      }
    }, SCROLL_CONFIG.STREAMING_INTERVAL);
  }

  stopStreamingScroll(): void {
    if (this.streamingInterval) {
      clearInterval(this.streamingInterval);
      this.streamingInterval = null;
    }
  }

  // Force scroll to bottom (for button click)
  forceScrollToBottom(): void {
    this.stopStreamingScroll();
    this.smoothScrollToBottom(SCROLL_CONFIG.SCROLL_DURATION * 1.5); // Slightly longer for user action
  }

  // Clean up
  destroy(): void {
    this.stopStreamingScroll();
    this.isScrolling = false;
  }
}

/**
 * Welcome screen component displayed when there are no messages
 * Style Grok: Logo et zone de saisie centrés, design épuré
 */
const WelcomeScreen: React.FC<{
  userName?: string;
  onStartChat?: () => void;
}> = ({ userName, onStartChat }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="max-w-2xl w-full text-center flex flex-col items-center">
        {/* Logo centré - Style Grok - Logo carré sans forme ronde */}
        <div className="mb-6">
          <div className="w-24 h-24 flex items-center justify-center mx-auto">
            {/* Logo de l'application - carré */}
            <img src={logo} alt="E-audit Logo" className="w-full h-full object-contain" />
          </div>
        </div>
        
        {/* Légende sous le logo */}
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-12">
          E-audit
        </h1>
        
        {/* Note: La zone de saisie sera affichée en bas par le composant parent ClaraAssistantInput */}
        {/* Elle sera toujours visible et centrée, même sur la page d'accueil */}
      </div>
    </div>
  );
};

/**
 * Loading screen component displayed when Clara is initializing
 * Centré verticalement entre le logo et la zone de saisie (style Grok/ChatGPT)
 */
const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="max-w-md text-center flex flex-col items-center">
        {/* Loading Animation - Logo carré */}
        <div className="w-20 h-20 flex items-center justify-center mb-6 animate-pulse">
          <img src={logo} alt="E-audit Logo" className="w-full h-full object-contain" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          E-audit
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Automatisez vos activités d'audit, risque, controle interne et fraude
        </p>

        {/* Progress bar - Centrée */}
        <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-gradient-to-r from-purple-500 to-sakura-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    </div>
  );
};

/**
 * Scroll to bottom button component
 */
const ScrollToBottomButton: React.FC<{
  onClick: () => void;
  show: boolean;
}> = ({ onClick, show }) => {
  if (!show) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-8 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
    >
      <ArrowDown className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-sakura-600 dark:group-hover:text-sakura-400" />
    </button>
  );
};

/**
 * Processing indicator component
 */
const ProcessingIndicator: React.FC<{
  processingState: ClaraProcessingState;
  message?: string;
}> = ({ processingState, message }) => {
  const getIndicatorContent = () => {
    switch (processingState) {
      case 'processing':
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          text: message || 'Automatisation E-audit',
          bgColor: 'bg-blue-500'
        };
      case 'success':
        return {
          icon: <Bot className="w-5 h-5" />,
          text: 'Response generated!',
          bgColor: 'bg-green-500'
        };
      case 'error':
        return {
          icon: <Bot className="w-5 h-5" />,
          text: message || 'Something went wrong',
          bgColor: 'bg-red-500'
        };
      default:
        return null;
    }
  };

  const content = getIndicatorContent();
  if (!content) return null;

  return (
    <div className="flex justify-center mb-4">
      <div className={`flex items-center gap-2 px-4 py-2 ${content.bgColor} text-white rounded-full text-sm`}>
        {content.icon}
        <span>{content.text}</span>
      </div>
    </div>
  );
};

/**
 * Main Clara Chat Window Component
 */
const ClaraChatWindow: React.FC<ClaraChatWindowProps> = ({
  messages,
  userName,
  isLoading = false,
  isInitializing = false,
  onRetryMessage,
  onCopyMessage,
  onEditMessage
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [processingState, setProcessingState] = useState<ClaraProcessingState>('idle');
  
  // Virtual scrolling state
  const [containerHeight, setContainerHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Smooth auto-scroll engine
  const autoScrollerRef = useRef<SmoothAutoScroller | null>(null);

  // Initialize auto-scroller
  useEffect(() => {
    autoScrollerRef.current = new SmoothAutoScroller(scrollRef.current, messagesEndRef.current);
    
    return () => {
      autoScrollerRef.current?.destroy();
    };
  }, []);

  // Update auto-scroller refs when elements change
  useEffect(() => {
    autoScrollerRef.current?.updateRefs(scrollRef.current, messagesEndRef.current);
  }, [scrollRef.current, messagesEndRef.current]);

  // Update container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (scrollRef.current) {
        setContainerHeight(scrollRef.current.clientHeight);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Handle scroll events with debouncing for performance
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const element = scrollRef.current;
    const newScrollTop = element.scrollTop;
    const { scrollHeight, clientHeight } = element;
    const nearBottom = scrollHeight - newScrollTop - clientHeight < SCROLL_CONFIG.SCROLL_THRESHOLD;
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Debounce scroll state updates for performance
    scrollTimeoutRef.current = setTimeout(() => {
      setScrollTop(newScrollTop);
      setIsNearBottom(nearBottom);
      setShowScrollButton(!nearBottom && messages.length > 0);
    }, VIRTUAL_CONFIG.SCROLL_DEBOUNCE);
  }, [messages.length]);

  // Set up scroll listener
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        scrollElement.removeEventListener('scroll', handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, [handleScroll]);

  // Enhanced auto-scroll for new messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

    const isStreaming = lastMessage?.metadata?.isStreaming;
    
    if (isStreaming) {
      // Start gentle streaming scroll
      autoScrollerRef.current?.startStreamingScroll();
    } else {
      // Stop streaming and scroll to new message
      autoScrollerRef.current?.stopStreamingScroll();
      autoScrollerRef.current?.scrollToNewMessage();
    }
  }, [messages.length]);

  // Handle streaming content updates
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.metadata?.isStreaming && lastMessage.content) {
      // Continue streaming scroll - the engine handles this automatically
      // No need for manual intervention
    }
  }, [messages[messages.length - 1]?.content]);

  // Update processing state based on loading and messages
  useEffect(() => {
    if (isLoading) {
      setProcessingState('processing');
    } else {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.metadata?.error) {
        setProcessingState('error');
        setTimeout(() => setProcessingState('idle'), 3000);
      } else if (lastMessage && lastMessage.role === 'assistant') {
        setProcessingState('success');
        setTimeout(() => setProcessingState('idle'), 2000);
      } else {
        setProcessingState('idle');
      }
    }
  }, [isLoading, messages]);

  // Handle message actions
  const handleMessageAction = useCallback((action: string, messageId: string, data?: any) => {
    switch (action) {
      case 'copy':
        onCopyMessage?.(data);
        break;
      case 'retry':
        onRetryMessage?.(messageId);
        break;
      case 'edit':
        onEditMessage?.(messageId, data);
        break;
    }
  }, [onCopyMessage, onRetryMessage, onEditMessage]);

  // Force scroll to bottom
  const forceScrollToBottom = useCallback(() => {
    autoScrollerRef.current?.forceScrollToBottom();
  }, []);

  // Performance optimization: Use a threshold to decide between virtual and normal rendering
  const shouldUseVirtualization = messages.length > 50; // Use virtualization for 50+ messages

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-6 relative"
      style={{ scrollBehavior: 'auto' }} // Let our custom scroller handle smooth behavior
    >
      <div className="max-w-4xl mx-auto" data-widescreen-target="container">
        {/* Loading screen when Clara is initializing */}
        {isInitializing ? (
          <LoadingScreen />
        ) : /* Welcome screen when no messages */ messages.length === 0 ? (
          <WelcomeScreen userName={userName} />
        ) : shouldUseVirtualization ? (
          // Use virtualized rendering for large message lists
          <VirtualizedMessageList
            messages={messages}
            userName={userName}
            containerHeight={containerHeight}
            scrollTop={scrollTop}
            onMessageAction={handleMessageAction}
            messagesEndRef={messagesEndRef}
          />
        ) : (
          // Use normal rendering for smaller message lists
          <div className="space-y-5">
            {/* Message list */}
            {messages.map((message) => (
              <ClaraMessageBubble
                key={message.id}
                message={message}
                userName={userName}
                isEditable={message.role === 'user'}
                onCopy={(content) => handleMessageAction('copy', '', content)}
                onRetry={(messageId) => handleMessageAction('retry', messageId)}
                onEdit={(messageId, newContent) => handleMessageAction('edit', messageId, newContent)}
              />
            ))}
            
            {/* Processing indicator */}
            <ProcessingIndicator 
              processingState={processingState}
              message={
                processingState === 'processing' 
                  ? '' 
                  : undefined
              }
            />
            
            {/* Invisible element to track end of messages */}
            <div ref={messagesEndRef} />
          </div>
        )}
        
        {/* Processing indicator for virtualized view */}
        {shouldUseVirtualization && (
          <div style={{ position: 'relative', zIndex: 1 }}>
            <ProcessingIndicator 
              processingState={processingState}
              message={
                processingState === 'processing' 
                  ? '' 
                  : undefined
              }
            />
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      <ScrollToBottomButton 
        show={showScrollButton}
        onClick={forceScrollToBottom}
      />
    </div>
  );
};

export default ClaraChatWindow; 